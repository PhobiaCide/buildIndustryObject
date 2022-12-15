/**
 * @name industryActivity
 * @description An array of objects representing different industry activities and their IDs
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
 * @name getData_
 * @description Takes as input a table name, a table address, and a toggle for using the cache service. If a table name and a table address are boh provided, the script will use the address. The response is parsed as JSON on the return.
 * @summary Fetches the given Eve Online Static Data Export .JSON conversion and returns the parsed JSON
 * @version 2.0.0
 * @date Dec 13, 2022
 * @author PhobiaCide
 * @copyright Andrew Amason 2022
 *
 * @param {object} options - An object containing properties which are parameters for getData_
 * @property {string} options.tableName - The name of the desired .JSON conversion file, defaults to {boolean} false
 * @property {string} options.tableAddress - The address of the desired .JSON conversion file, has preference over options.tableName, defaults to {boolean} false
 * @property {boolean} options.useCache - Weather to use the cache service or not
 *
 * @return {object}
 */
function getData_({
	tableName = false,
	tableAddress = false,
	useCache = false
} = options) {
	return !tableAddress
		? !tableName
			? new Error(`getData_({
           tableName:_______{${typeof tableName}}________${tableName},
           tableAddress:____{${typeof tableAddress}}_____${tableAddress}
         }); 
         Error: No valid arguments!`)
			: !useCache
			? JSON.parse(
					UrlFetchApp.fetch(
						tables.find(table => {
							return table.name == tableName;
						}).href
					).getContentText()
			  )
			: JSON.parse(
					cacheUrlFetchApp_(
						tables.find(table => {
							return table.name == tableName;
						}).href
					)
			  )
		: !useCache
		? JSON.parse(UrlFetchApp.fetch(tableAddress).getContentText())
		: JSON.parse(cacheUrlFetchApp_(tableAddress));
}

/**
 * @name tables
 * @description An array of objects, each of wich contains a name and address to an Eve Online Static Data Export .JSON conversion
 *
 * @return null
 */
const tables = getData_({
	tableAddress: 'http://sde.zzeve.com/tables.json',
	useCache: true
});

/**
 * @name invMarketGroups
 * @example [...{ marketGroupID, marketGroupName, description }]
 */
const invMarketGroups = getData_({
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
 * @name invcategories
 * @description An array of objects, each of which represents a different item category from the game, Eve Online. The list is filtered for only published entries and only certain attributes are mapped.
 * @example [...{ categoryID, categoryName }]
 */
const invCategories = getData_({
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
 * @name invGroups
 * @description An array of objects, each of which represents a different item group from the game, Eve Online. The list is filtered for only published entries and only certain attributes are mapped.
 * @example [...{ groupID, groupName, categoryID }]
 */
const invGroups = getData_({
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
 * @name invTypes
 * @description An array of objects, each of which represents a different Eve Online item. The list is filtered for only published entries and only certain attributes are mapped.
 * @example [...{ typeID, typeName, description, groupID, marketGroupID }]
 */
const invTypes = getData_({
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
 *
 */
const publishedTypeIDs = invTypes.map(entry => entry.typeID);

/**
 * @name industryActivityMaterials
 * @description Executes immediately and returns an array of objects
 * @example [...{typeID, activityID, material_typeID, quantity}]
 *
 * @return {array}
 */
const industryActivityMaterials = getData_({
	tableName: 'industryActivityMaterials'
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});

/**
 * @name industryActivityProducts
 * @description Executes immediately and returns an array of objects
 * @example [...{typeID, type_name, product_typeID, quantity}]
 *
 * @return {array}
 */
const industryActivityProducts = (() => {
	return getData_({
		tableName: 'industryActivityProducts'
	})
		.filter(entry => {
			return publishedTypeIDs.includes(entry.typeID);
		})
		.filter(entry => {
			return entry.activityID == 1 || entry.activityID == 9;
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
})();

/**
 * @name industryActivity
 * @description Executes immediately and returns an array of objects
 * @example [...{typeID, activityID, time}]
 *
 * @return {array}
 */
const industryActivity = getData_({
	tableName: 'industryActivity'
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});

/**
 * @name industryActivityProbabilities
 * @description Executes immediately and returns an array of objects
 * @example [...{typeID, activityID, material_typeID, quantity}]
 *
 * @return {array}
 */
const industryActivityProbabilities = getData_({
	tableName: `industryActivityProbabilities`
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});

/**
 * @name industryActivitySkills
 * @description Executes immediately and returns an array of objects
 * @example [...{typeID, activityID, material_typeID, quantity}]
 *
 * @return {array}
 */
const industryActivitySkills = getData_({
	tableName: `industryActivitySkills`
})
	.filter(entry => {
		return publishedTypeIDs.includes(entry.typeID);
	})
	.sort((a, b) => {
		return a.typeID - b.typeID;
	});

/**
 * @name typeName_
 * @description Returns a type name for a given Type ID
 *
 * @return {string}
 */
function typeName_(typeID) {
	// search in invTypes...
	const type = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "type_name" from entry if it is defined...
	return typeof type != 'undefined'
		? type.typeName
		: new Error(`typeName from typeID ${typeID} is ${typeof type}`);
}

/**
 * @name groupName_
 * @description Returns a group name for a given group ID
 *
 * @return {string}
 */
function groupID_(typeID) {
	// search in invTypes...
	const group = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "type_name" from entry if it is defined...
	return typeof group != 'undefined'
		? group.groupID
		: new Error(`groupID from typeID ${typeID} is ${typeof group}`);
}

/**
 * @name groupName_
 * @description Returns a group name for a given group ID
 *
 * @return {string}
 */
function groupName_(groupID) {
	// search in invGroups...
	const group = invGroups.find(element => {
		// until a match is found...
		return element.groupID == groupID;
	});
	// return "type_name" from entry if it is defined...
	return typeof group != 'undefined'
		? group.groupName
		: new Error(`groupName from groupID ${groupID} is ${typeof group}`);
}
function marketGroupID_(typeID) {
	const marketGroup = invTypes.find(element => {
		return element.typeID == typeID;
	});
	return typeof marketGroup != `undefined`
		? marketGroup.marketGroupID
		: new Error(
				`marketGroupID from typeID ${typeID} is ${typeof marketgroup}.`
		  );
}
function marketGroupName_(marketGroupID) {
	const marketGroup = invMarketGroups.find(element => {
		return element.marketGroupID == marketGroupID;
	});
	return typeof marketGroup != `undefined`
		? marketGroup.marketGroupName
		: new Error(
				`marketGroupName from marketGroupID ${marketGroupID} is ${typeof marketGroup}.`
		  );
}
/**
 *
 */
function categoryID_(groupID) {
	const category = invGroups.find(element => {
		return element.groupID == groupID;
	});
	return typeof category != `undefined`
		? category.categoryID
		: new Error(`categoryID from groupID ${groupID} is ${typeof category}`);
}

/**
 * @name categoryName_
 * @description Returns a category name for a given category ID
 *
 * @return {string}
 */
function categoryName_(categoryID) {
	// search in invGroups...
	const category = invCategories.find(element => {
		// until a match is found...
		return element.categoryID == categoryID;
	});
	// return "categoryName" from entry if it is defined...
	return typeof category != 'undefined'
		? category.categoryName
		: new Error(
				`categoryName from categoryID ${categoryID} is ${typeof category}`
		  );
}

/**
 * @name activityName_
 * @description Returns an activity name for a given activity ID
 *
 * @return {string}
 */
function activityName_(activityID) {
	// search in invTypes...
	const activity = industryActivities.find(element => {
		// until a match is found...
		return element.activityID == activityID;
	});
	// return "type_name" from entry if it is defined...
	return typeof activity != 'undefined'
		? activity.activityName
		: new Error(
				`activityName from activityID ${activityID} is ${typeof activity}`
		  );
}

/**
 * @name industryActivityMaterials
 * @description Executes immediately and returns a list of all material Type IDs
 *
 * @return {array}
 */
const blueprints = industryActivityProducts
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
					name: typeName_(entry.materialTypeID),
					quantity: entry.quantity,
					group: groupName_(groupID_(entry.materialTypeID)),
					marketGroup: marketGroupName_(marketGroupID_(entry.materialTypeID)),
					category: categoryName_(categoryID_(groupID_(entry.materialTypeID))),
					imgUrl: `https://images.evetech.net/types/${entry.materialTypeID}/icon`
				};
			});
		const blueprint = {
			name: typeName_(blueprintTypeID),
			group: groupName_(groupID_(blueprintTypeID)),
			marketGroup: marketGroupName_(marketGroupID_(blueprintTypeID)),
			category: categoryName_(categoryID_(groupID_(blueprintTypeID))),
			imgUrl: `https://images.evetech.net/types/${blueprintTypeID}/bp`
		};
		const product = {
			name: typeName_(productTypeID),
			group: groupName_(groupID_(productTypeID)),
			marketGroup: marketGroupName_(marketGroupID_(productTypeID)),
			category: categoryName_(categoryID_(groupID_(productTypeID))),
			imgUrl: `https://images.evetech.net/types/${productTypeID}/icon`
		};
		const activityName = activityName_(activityID);
		const time = industryActivity.find(activity => {
			return (
				activity.typeID == blueprintTypeID && activity.activityID == activityID
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
					skillName: typeName_(activity.skillID),
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
