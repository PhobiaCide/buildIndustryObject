/**
 * @file buildIndustryObject.js
 * @version 2.0.0
 * @author PhobiaCide
 * @copyright 2022 Andrew Amason
 */

/**
 * @function cacheUrlFetchApp
 * @description Checks if the return from a Url fetch is in cache. If so, retrieves it from cache instead of making another network request. If not, makes a new request and adds it to the cache.
 * @summary Speeds up execution by storing frequently requested data to the cache.
 * @param       {string}        fetchUrl                        - The address to which to make the request
 * @param       {object}        [parameters]                    - Optional Parameters
 * @property    {string}        [parameters.method = `get`]     - The API method to use
 * @property    {string}        [parameters.payload = ``]       - Optional payload
 * @return      {*}             result                          - The result of the fetch
 */
function cacheUrlFetchApp(
	fetchUrl,
	parameters = { method: `get`, payload: `` }
) {
	// Set up public cache
	const cache = CacheService.getScriptCache();
	// convert Url into a string based on MD5
	const digest = Utilities.base64Encode(
		Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, fetchUrl)
	);
	// using digest as key, check if it is in cache
	const cached = cache.get(digest);
	// if a result is already cached, use it
	if (cached != null) {
		return cached;
	}
	// random "wait" invertals between requests to avoid server overload
	Utilities.sleep(Math.random() * 5000);
	// do the fetch
	const result = UrlFetchApp.fetch(fetchUrl, parameters).getContentText();
	// cache result
	cache.put(digest, result, 21600); //maximum cache time is 6 hours, or 21600 seconds.
	// return result
	return result;
}
/**
 * @function getData
 * @description Takes as input a table name, a table address, and a toggle for using the cache service. If a table name and a table address are boh provided, the script will use the address. The response is parsed as JSON on the return.
 * @summary Fetches the given Eve Online Static Data Export .JSON conversion and returns the parsed JSON
 * @param {object} options - An object containing properties which are parameters for getData
 * @property {(string|boolean)} [options.tableName = false] - The name of the desired .JSON conversion file.
 * @property {(string|boolean)} [options.tableAddress = false] - The address of the desired .JSON conversion file, has preference over options.tableName.
 * @property {boolean} [options.useCache = false] - Weather to use the cache service or not
 *
 * @return {object}
 */
function getData({
	tableName = false,
	tableAddress = false,
	useCache = false
} = options) {
	return !tableAddress
		? !tableName
			? new Error(
					`getData({
         tableName:_______{${typeof tableName}}________${tableName},
         tableAddress:____{${typeof tableAddress}}_____${tableAddress}})
         Error: No valid arguments!`
			  )
			: !useCache
			? JSON.parse(
					UrlFetchApp.fetch(
						tables.find(table => {
							return table.name == tableName;
						}).href
					).getContentText()
			  )
			: JSON.parse(
					cacheUrlFetchApp(
						tables.find(table => {
							return table.name == tableName;
						}).href
					)
			  )
		: !useCache
		? JSON.parse(UrlFetchApp.fetch(tableAddress).getContentText())
		: JSON.parse(cacheUrlFetchApp(tableAddress));
}
/**
 * @constant industryActivities
 * @description An array of objects representing different industry activities and their IDs
 * @property {number} activityID
 * @property {string} activityName
 */
const industryActivities = [
	{
		activityID: 1,
		activityName: 'Manufacturing'
	},
	{
		activityID: 3,
		activityName: 'Researching Time Efficiency'
	},
	{
		activityID: 4,
		activityName: 'Researching Material Efficiency'
	},
	{
		activityID: 5,
		activityName: 'Copying'
	},
	{
		activityID: 8,
		activityName: 'Invention'
	},
	{
		activityID: 9,
		activityName: 'Reactions'
	}
];
/**
 * @constant tables
 * @description An array of objects, each of wich contains a name and address to an Eve Online Static Data Export .JSON conversion
 */
const tables = getData({
	tableAddress: 'http://sde.zzeve.com/tables.json',
	useCache: true
});
/**
 * @constant invMarketGroups
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "invMarketGroups."
 * @example [...{ marketGroupID, marketGroupName, description }]
 */
const invMarketGroups = getData({
	tableName: 'invMarketGroups'
})
	.map(entry => {
		return {
			marketGroupID: entry.marketGroupID,
			marketGroupName: entry.marketGroupName,
			description: entry.description
		};
	})
	.sort((a, b) => {
		return a.marketGroupID - b.marketGroupID;
	});
/**
 * @constant invCategories
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "invCategories", the list is filtered for only published entries.
 * @example [...{ categoryID, categoryName }]
 */
const invCategories = getData({
	tableName: `invCategories`,
	useCache: true
})
	.filter(
		// filter for entries where "published" is not zero...
		entry => {
			return entry.published != 0;
		}
	)
	.map(
		// for each array entry...
		entry => {
			// return an object with these properties...
			return {
				categoryID: entry.categoryID,
				categoryName: entry.categoryName
			};
		}
	)
	.sort((a, b) => {
		return a.categoryID - b.categoryID;
	});
/**
 * @constant invGroups
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "invGroups", the list is filtered for only published entries.
 * @property {number} groupID
 * @property {string} groupName
 * @property {string} categoryID
 * @example [...{ groupID, groupName, categoryID }]
 */
const invGroups = getData({
	tableName: `invGroups`
})
	.filter(
		// filter for entries where "published" is not zero...
		entry => {
			return entry.published != 0;
		}
	)
	.map(
		// for each array entry...
		entry => {
			// return an object with these attributes...
			return {
				groupID: entry.groupID,
				groupName: entry.groupName,
				categoryID: entry.categoryID
			};
		}
	)
	.sort((a, b) => {
		return a.groupID - b.groupID;
	});
/**
 * @constant invTypes
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "invTypes", the list is filtered for only published entries and only certain attributes are mapped.
 * @property {(string|number)} typeID -
 * @property {string} typeName -
 * @property {string} description -
 * @property {(string|number)} groupID -
 * @property {(string|number)} marketGroupID -
 * @example [...{ typeID, typeName, description, groupID, marketGroupID }]
 */
const invTypes = getData({
	tableName: 'invTypes'
})
	.filter(
		// filter for entries where "published" is not zero...
		entry => {
			return entry.published != 0;
		}
	)
	.map(
		// for each array entry...
		entry => {
			// return an object with these attributes...
			return {
				typeID: entry.typeID,
				typeName: entry.typeName,
				description: entry.description,
				groupID: entry.groupID,
				marketGroupID: entry.marketGroupID
			};
		}
	)
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @constant publishedTypeIDs
 * @description Takes invTypes and takes the typeID from each entry and returns them all in an array
 */
const publishedTypeIDs = invTypes.map(entry => entry.typeID);
/**
 * @constant industryActivityMaterials
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivityMaterials", the list is filtered for only published entries.
 * @example [...{typeID, activityID, materialtypeID, quantity}]
 */
const industryActivityMaterials = getData({
	tableName: 'industryActivityMaterials'
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @const industryActivityProducts
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivityProducts", the list is filtered for only published entries and only certain attributes are mapped.
 * @example [...{typeID, typeName, productTypeID, quantity}]
 */
const industryActivityProducts = getData({
	tableName: 'industryActivityProducts'
})
	.filter(entry => {
		return (
			publishedTypeIDs.includes(entry.typeID) &&
			publishedTypeIDs.includes(entry.productTypeID) &&
			(entry.activityID == 1 || entry.activityID == 9)
		);
	})
	.map(entry => {
		return {
			typeID: entry.typeID,
			activityID: entry.activityID,
			productTypeID: entry.productTypeID,
			quantity: entry.quantity
		};
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @constant industryActivity
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivities."
 * @example [...{typeID, activityID, time}]
 */
const industryActivity = getData({
	tableName: 'industryActivity'
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @constant industryActivityProbabilities
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivityProbabilities."
 * @example [...{typeID, activityID, materialTypeID, quantity}]
 */
const industryActivityProbabilities = getData({
	tableName: `industryActivityProbabilities`
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @constant industryActivitySkills
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivitySkills."
 * @example [...{typeID, activityID, materialTypeID, quantity}]
 */
const industryActivitySkills = getData({
	tableName: `industryActivitySkills`
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});
/**
 * @function typeName
 * @description Returns a item type name for a given item type ID
 * @param {(string|number)} typeID - the ID number for a a particular item type
 * @return {string}
 */
function typeName(typeID) {
	// search in invTypes...
	const type = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "typename" from entry if it is defined...
	return typeof type != 'undefined'
		? type.typeName
		: new Error(
				`typeName({${typeof typeID}} ${typeID}) cannot be: ${typeof type}.typeName`
		  );
}
/**
 * @function groupID
 * @description Returns a group ID for a given item type ID
 * @param {(string|number)} typeID - the ID number for a particular item type
 * @return {string}
 */
function groupID(typeID) {
	// search in invTypes...
	const group = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "typename" from entry if it is defined...
	return typeof group != 'undefined'
		? group.groupID
		: new Error(
				`groupID({${typeof typeID}} ${typeID}) cannot be: ${typeof group}.groupID`
		  );
}
/**
 * @function groupName
 * @description Returns a group name for a given item group ID
 * @param {(string|number)} groupID - the ID number for a a particular item group
 * @return {string}
 */
function groupName(groupID) {
	// search in invGroups...
	const group = invGroups.find(element => {
		// until a match is found...
		return element.groupID == groupID;
	});
	// return "typename" from entry if it is defined...
	return typeof group != 'undefined'
		? group.groupName
		: new Error(
				`groupName({${typeof groupID}} ${groupID}) cannot be: ${typeof group}.groupName`
		  );
}
/**
 * @function marketGroupID
 * @description Returns a market group ID for a given item type ID
 * @param {(string|number)} typeID - the ID number for a particular item type
 * @return {string}
 */
function marketGroupID(typeID) {
	const marketGroup = invTypes.find(element => {
		return element.typeID == typeID;
	});
	return typeof marketGroup != `undefined`
		? marketGroup.marketGroupID
		: new Error(
				`marketGroupID({${typeof typeID}} ${typeID}) cannot be: ${typeof marketGroup}.marketGroupID`
		  );
}
/**
 * @function marketGroupName
 * @description Returns a market group name for a given item market group ID
 * @param {(string|number)} marketGroupID - the ID number for a particular item market group
 * @return {string}
 */
function marketGroupName(marketGroupID) {
	const marketGroup = invMarketGroups.find(element => {
		return element.marketGroupID == marketGroupID;
	});
	return typeof marketGroup != `undefined`
		? marketGroup.marketGroupName
		: new Error(
				`marketGroupName({${typeof marketGroupID}} ${marketGroupID}) cannot be: ${typeof marketGroup}.groupID`
		  );
}
/**
 * @function categoryID
 * @description Returns a category ID for a given group ID
 * @param {(string|number)} groupID - the ID number for a particular item group
 * @return {string}
 */
function categoryID(groupID) {
	const category = invGroups.find(element => {
		return element.groupID == groupID;
	});
	return typeof category != `undefined`
		? category.categoryID
		: new Error(
				`categoryID({${typeof groupID}} ${groupID}) cannot be: ${typeof category}.categoryID`
		  );
}
/**
 * @function categoryName
 * @description Returns a category name for a given category ID
 * @param {(string|number)} categoryID - the ID number for a particular item category
 * @return {string}
 */
function categoryName(categoryID) {
	// search in invGroups...
	const category = invCategories.find(element => {
		// until a match is found...
		return element.categoryID == categoryID;
	});
	// return "categoryName" from entry if it is defined...
	return typeof category != 'undefined'
		? category.categoryName
		: new Error(
				`categoryName({${typeof categoryID}} ${categoryID}) cannot be: ${typeof category}.categoryName`
		  );
}
/**
 * @function activityName
 * @description Returns an activity name for a given activity ID
 * @param {(string|number)} activityID - the ID number for a particular industry activity
 * @return {string}
 */
function activityName(activityID) {
	// search in invTypes...
	const activity = industryActivities.find(element => {
		// until a match is found...
		return element.activityID == activityID;
	});
	// return "typename" from entry if it is defined...
	return typeof activity != 'undefined'
		? activity.activityName
		: new Error(
				`activityName({${typeof activityID}} ${activityID}) cannot be: ${typeof activity}.activityName`
		  );
}
/**
 * @function blueprints
 * @description Compiles all the data into an array of objects.
 * @return {array}
 */
function blueprints() {
	return industryActivityProducts
		.reduce(
			// call the "reduce" array method to remove duplicates...
			(unique, item) =>
				// if "item" is already listed in "unique", then "unique" is left unchanged. Otherwise, add "item" to "unique"...
				unique.includes(item.productTypeID)
					? unique
					: [...unique, item.productTypeID],
			// inital value for unique
			[]
		)
		.map(productTypeID => {
			const {
				activityID,
				typeID: blueprintTypeID,
				quantity
			} = industryActivityProducts.find(entry => {
				return entry.productTypeID == productTypeID;
			});
			const materials = industryActivityMaterials
				.filter(entry => {
					return (
						entry.typeID == blueprintTypeID && entry.activityID == activityID
					);
				})
				.map(entry => {
					return {
						name: typeName(entry.materialTypeID),
						quantity: entry.quantity,
						group: groupName(groupID(entry.materialTypeID)),
						marketGroup: marketGroupName(marketGroupID(entry.materialTypeID)),
						category: categoryName(categoryID(groupID(entry.materialTypeID))),
						imgUrl: `https://images.evetech.net/types/${entry.materialTypeID}/icon`
					};
				});
			const blueprint = {
				name: typeName(blueprintTypeID),
				group: groupName(groupID(blueprintTypeID)),
				marketGroup: marketGroupName(marketGroupID(blueprintTypeID)),
				category: categoryName(categoryID(groupID(blueprintTypeID))),
				imgUrl: `https://images.evetech.net/types/${blueprintTypeID}/bp`
			};
			const product = {
				name: typeName(productTypeID),
				group: groupName(groupID(productTypeID)),
				marketGroup: marketGroupName(marketGroupID(productTypeID)),
				category: categoryName(categoryID(groupID(productTypeID))),
				imgUrl: `https://images.evetech.net/types/${productTypeID}/icon`
			};
			const activityName = activityName(activityID);
			const time = industryActivity.find(activity => {
				return (
					activity.typeID == blueprintTypeID &&
					activity.activityID == activityID
				);
			}).time;
			const skills = industryActivitySkills
				.filter(activity => {
					return (
						activity.typeID == blueprintTypeID &&
						activity.activityID == activityID
					);
				})
				.map(activity => {
					return {
						skillName: typeName(activity.skillID),
						level: activity.level
					};
				});
			const probability =
				typeof industryActivityProbabilities.find(activity => {
					return (
						activity.typeID == blueprintTypeID &&
						activity.activityID == activityID
					);
				}) != 'undefined'
					? probabilities.probability
					: 1;
			return {
				blueprint,
				product,
				quantity,
				activityName,
				materials,
				time,
				probability,
				skills
			};
		});
}
