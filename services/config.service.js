const _ = require("lodash");
const DbService = require("db-mixin");
const { match } = require("moleculer").Utils;

module.exports = {
	name: "config",
	version: 1,

	mixins: [DbService({ createActions: false, collection: 'config' })],

	/**
	 * Service settings
	 */
	settings: {
		defaultConfig: {},

		// Fields in responses
		fields: {
			key: { type: "string", empty: false, required: true },
			value: { type: "any" },
			isDefault: { type: "boolean", default: true },
			createdAt: {
				type: "number",
				readonly: true,
				hidden: "byDefault",
				onCreate: () => Date.now()
			},
			updatedAt: {
				type: "number",
				readonly: true,
				hidden: "byDefault",
				onUpdate: () => Date.now()
			}
		},

		// Indexes on collection
		indexes: [{ fields: "key", unique: true }]
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Get configurations by key or keys
		 *
		 * @actions
		 * @param {String|Array<String>} key
		 * @returns {Object|Array<String>}
		 */
		get: {
			tracing: process.env.NODE_ENV == "production",
			cache: {
				keys: ["key"]
			},
			params: {
				key: [{ type: "string" }, { type: "array", items: "string" }]
			},
			async handler(ctx) {
				return await this.get(ctx.params.key);
			}
		},

		/**
		 * Set configuration values by keys
		 *
		 * @actions
		 * @param {String} key
		 * @param {any} key
		 * @returns {Object|Array<Object>}
		 */
		set: {
			params: {
				$$root: true,
				type: "multi",
				rules: [
					{
						type: "object",
						properties: {
							key: { type: "string", empty: false, required: true },
							value: { type: "any" }
						}
					},
					{
						type: "array",
						items: {
							type: "object",
							properties: {
								key: { type: "string", empty: false, required: true },
								value: { type: "any" }
							}
						}
					}
				]
			},
			async handler(ctx) {
				if (Array.isArray(ctx.params)) {
					return this.Promise.all(
						ctx.params.map(async p => {
							let { changed, item } = await this.set(p.key, p.value);
							if (changed) ctx.broadcast(`config.changed`, item);

							return item;
						})
					);
				} else {
					let { changed, item } = await this.set(ctx.params.key, ctx.params.value);
					if (changed) ctx.broadcast(`config.changed`, item);

					return item;
				}
			}
		},

		/**
		 * Get all config settings.
		 */
		all: {
			tracing: false,
			cache: true,
			visibility: "protected",
			handler(ctx) {
				return this.findEntities(ctx, {});
			}
		},

		/**
		 * Run configuration migration. Add missing keys.
		 */
		migrate: {
			cache: false,
			visibility: "protected",
			handler() {
				return this.Promise.all(
					Object.keys(this.settings.defaultConfig).map(async key => {
						const value = this.settings.defaultConfig[key];
						const item = await this.get(key);
						if (!item) {
							this.logger.info(`Save new config: "${key}" =`, value);
							return this.set(key, value, true);
						} else if (item.isDefault && !_.isEqual(item.value, value)) {
							this.logger.info(`Update default config: "${key}" =`, value);
							return this.set(key, value, true);
						}
					})
				);
			}
		}
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Get configurations by key(s).
		 *
		 * @methods
		 * @param {String|Array<String>} key Config key
		 * @returns {Object|Array<Object>}
		 */
		async get(key) {
			if (Array.isArray(key)) {
				const res = await this.Promise.all(key.map(k => this.getOne(k)));
				return _.uniqBy(_.flattenDeep(res), item => item.key);
			}

			return await this.getOne(key);
		},

		/**
		 * Get configurations by one key (can contain wildcards).
		 *
		 * @methods
		 * @param {String} key Config key
		 * @returns {Object|Array<Object>}
		 */
		async getOne(key) {
			if (key.indexOf("*") == -1 && key.indexOf("?") == -1)
				return await this.findEntity(this.getContext(), { query: { key } });

			return await this.getByMask(key);
		},

		/**
		 * Get configurations by key mask.
		 *
		 * @methods
		 * @param {String} mask Key mask
		 * @returns {Array<Object>}
		 */
		async getByMask(mask) {
			const allItems = await (this.getContext() || this.broker).call(`${this.fullName}.all`);

			/* istanbul ignore next */
			if (!allItems) return [];

			return allItems.filter(item => match(item.key, mask));
		},

		/**
		 * Set a configuration value.
		 *
		 * @methods
		 * @param {String} key Key
		 * @param {any} value Value
		 * @param {Boolean} isDefault
		 *
		 * @returns {Object}
		 */
		async set(key, value, isDefault = false) {
			const ctx = this.getContext();
			const item = await this.findEntity(ctx, { query: { key } });
			if (item != null) {
				if (!_.isEqual(item.value, value)) {
					// Modify
					console.log(item)
					return {
						item: await this.updateEntity(ctx, {
							id: item.id,
							value,
							isDefault
						}),
						changed: true,
						new: false
					};
				}

				// No changes
				return {
					item,
					changed: false,
					new: false
				};
			}

			console.log({ key, value, isDefault })
			// Create a new one
			return {
				item: await this.createEntity(ctx, { key, value, isDefault }),
				changed: true,
				new: true
			};
		}
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		return await this.actions.migrate();
	}
};