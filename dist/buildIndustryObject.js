/**
 * @file
 * @alias buildIndustryObject.js
 * @version 2.0.0
 * @description blank
 * @summary blank
 * @author PhobiaCide
 * @license MIT license
 * @copyright © 2022 Andrew Amason
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const HEADER = `
	█▀▀▄ █░░█ ░▀░ █░░ █▀▀▄ ░▀░ █▀▀▄ █▀▀▄ █░░█ █▀▀█ █▀▀▄ ░░▀ █▀▀ █▀▀ ▀▀█▀▀ ░ ░░▀ █▀▀
	█▀▀▄ █░░█ ▀█▀ █░░ █░░█ ▀█▀ █░░█ █░░█ █▄▄█ █░░█ █▀▀▄ ░░█ █▀▀ █░░ ░░█░░ ▄ ░░█ ▀▀█
	▀▀▀░ ░▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀░ ▀▀▀ ▀░░▀ ▀▀▀░ ▄▄▄█ ▀▀▀▀ ▀▀▀░ █▄█ ▀▀▀ ▀▀▀ ░░▀░░ █ █▄█ ▀▀▀
`;
/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias getData
 * @description Takes as input a table name, a table address, and a toggle for using the cache service. If a table name and a table address are boh provided, the script will use the address. The response is parsed as JSON on the return.
 * @summary Fetches the given Eve Online Static Data Export .JSON conversion and returns the parsed JSON
 * @throws Will throw error if neither tableName nor tableAddress are defined
 * @param 		{object} 						options 												- An object containing properties which are parameters for getData
 * @property 	{(string|boolean)} 	[options.tableName = false] 		- The name of the desired .JSON conversion file.
 * @property 	{(string|boolean)} 	[options.tableAddress = false]	- The address of the desired .JSON conversion file, has preference over options.tableName.
 * @return 		{object} 																						- The requested data
 */
function getData(tableName = false) {
	return !tableName	? new Error(`getData, Error: tableName in not defined!`)
		: JSON.parse(
				UrlFetchApp.fetch(
					staticData.find(table => {
						return table.name == tableName;
					}).href
				).getContentText()
		  );
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant industryActivities
 * @description An array of objects, each of which represents a different industry activity and corresponding ID
 * @property 	{number} 						activityID											-
 * @property 	{string} 						activityName										-
 */
const industryActivities = Object.freeze([
	Object.freeze({ activityID: 1, activityName: 'Manufacturing' }),
	Object.freeze({ activityID: 3, activityName: 'Researching Time Efficiency' }),
	Object.freeze({ activityID: 4, activityName: 'Researching Material Efficiency' }),
	Object.freeze({ activityID: 5, activityName: 'Copying' }),
	Object.freeze({ activityID: 8, activityName: 'Invention' }),
	Object.freeze({ activityID: 9, activityName: 'Reactions' })
]);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant {object} staticData
 * @description An array of objects, each of which contains a name and address to an Eve Online Static Data Export .JSON conversion
// TODO (developer) Add summary
 */
const staticData = Object.freeze(
	JSON.parse(UrlFetchApp.fetch(`http://sde.zzeve.com/staticData.json`).getContentText())
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias invMarketGroups
 * @description Compiles an array of objects, each of which represents a different item. Taken from the SDE table, "invMarketGroups."
// TODO (developer) Add summary
 * @example [{ marketGroupID, marketGroupName, description }, ...]
 * @property 	{(number|string)}		marketGroupID										- Identification number for a particular market group
 * @property 	{string} 						marketGroupName 								- Name of a particular market group
 * @property 	{string} 						description											- Description of a particular market group
 */
const invMarketGroups = Object.freeze(
	getData(`invMarketGroups`)
		.map(marketGroup => {
			return Object.freeze({
				description: marketGroup.description,
				marketGroupID: marketGroup.marketGroupID,
				marketGroupName: marketGroup.marketGroupName
			});
		})
		.sort((marketGroupA, marketGroupB) => {
			return marketGroupA.marketGroupID - marketGroupB.marketGroupID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias invCategories
 * @description Compiles an array of objects, each of which represents a different item category, the parent of group. Taken from the SDE table, "invCategories", the list is filtered for only published entries.
 * @example [{ categoryID, categoryName }, ...]
 * @property 		{(number|string)} 	categoryID 				- Identification number for the group to which a particular type belongs
 * @property 		{string} 						categoryName 			- Name of a particular group
 */
const invCategories = Object.freeze(
	getData(`invCategories`)
		// filter for only categories where...
		.filter(category => {
			// "published" is not zero...
			return category.published != 0;
		})
		// map each category...
		.map(category => {
			// return an object with these properties...
			return Object.freeze({
				categoryID: category.categoryID,
				categoryName: category.categoryName
			});
		})
		.sort((categoryA, categoryB) => {
			return categoryA.categoryID - categoryB.categoryID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias invGroups
 * @description Compiles an array of objects, each of which represents a different item group, the parent of type. Taken from the SDE table, "invGroups", the list is filtered for only published entries.
 * @summary A list of group ID numbers and corresponding information
 * @example [{ groupID, groupName, categoryID }, ...]
 * @property {(number|string)} 			groupID 					- Identification number for the group to which a particular type belongs
 * @property {string} 							groupName 				- Name of a particular group
 * @property {(number|string)} 			categoryID 				- Identification number for a category to which a particular group belongs
 */
const invGroups = Object.freeze(
	getData(`invGroups`)
		// filter for only groups where...
		.filter(group => {
			// "published" is not zero...
			return group.published != 0;
		})
		// map each group...
		.map(group => {
			// return an object with these attributes...
			return Object.freeze({
				groupID: group.groupID,
				groupName: group.groupName,
				categoryID: group.categoryID
			});
		})
		// sort by groupID ascending
		.sort((groupA, groupB) => {
			return groupA.groupID - groupB.groupID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias invTypes
 * @description Compiles an array of objects, each of which represents a different item. Taken from the SDE table, "invTypes", the list is filtered for only published entries and only certain attributes are mapped.
 * @summary	A list of type IDs and corresponding information
 * @example	[{ typeID, typeName, description, groupID, marketGroupID }, ...]
 * @property {(string|number)} 			typeID 						- Identification number for a particular type
 * @property {string} 							typeName 					- Name of a particular type
 * @property {string} 							description 			- This is displayed in-game in the show info panel on the "description" tab
 * @property {(string|number)} 			groupID 					- Identification number for the group to which a particular type belongs
 * @property {(string|number)} 			marketGroupID 		- Identification number for the market group to which a particular type belongs
 */
const invTypes = Object.freeze(
	getData(`invTypes`)
		// filter for types where...
		.filter(type => {
			// "published" is not zero...
			return type.published != 0;
		})
		// map each type...
		.map(type => {
			// return an object with these properties...
			return Object.freeze({
				typeID: type.typeID,
				groupID: type.groupID,
				typeName: type.typeName,
				description: type.description,
				marketGroupID: type.marketGroupID
			});
		})
		// sort by typeID ascending
		.sort((typeA, typeB) => {
			return typeA.typeID - typeB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias publishedTypeIDs
 * @description Takes invTypes and takes the typeID from each entry and returns them all in an array
 * @summary A list of all the published type IDs
 */
const publishedTypeIDs = invTypes.map(entry => entry.typeID);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias industryActivityMaterials
 * @description Returns an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivityMaterials", the list is filtered for only published entries.
 * @example [ {typeID, activityID, materialTypeID, quantity }, ...]
 */
const industryActivityMaterials = Object.freeze(
	getData(`industryActivityMaterials`)
		// filter blueprints for only those...
		.filter(blueprint => {
			// that are included in the array "publishedTypeIDs"
			return publishedTypeIDs.includes(blueprint.typeID);
		})
		// sort by typeID ascending
		.sort((blueprintA, blueprintB) => {
			return blueprintA.typeID - blueprintB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias industryActivityProducts
 * @description Returns an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivityProducts", the list is filtered for only published entries and only certain attributes are mapped.
 * @example [{typeID, typeName, productTypeID, quantity}, ...]
 */
const industryActivityProducts = Object.freeze(
	getData(`industryActivityProducts`)
		// filter blueprints for only those...
		.filter(blueprint => {
			return (
				// that are included in publishedTypeIDs AND...
				publishedTypeIDs.includes(blueprint.typeID) &&
				// whose products are included in publishedTypeIDs AND...
				publishedTypeIDs.includes(blueprint.productTypeID) &&
				// whose activityID is either 1 OR 9...
				(blueprint.activityID == 1 || blueprint.activityID == 9)
			);
		})
		// map each blueprint...
		.map(blueprint => {
			// return an object with these properties...
			return Object.freeze({
				typeID: blueprint.typeID,
				quantity: blueprint.quantity,
				activityID: blueprint.activityID,
				productTypeID: blueprint.productTypeID
			});
		})
		// sort by typeID ascending...
		.sort((blueprintA, blueprintB) => {
			return blueprintA.typeID - blueprintB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias industryActivity
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivities."
 * @example [{typeID, activityID, time}, ...]
 */
const industryActivity = Object.freeze(
	getData(`industryActivity`)
		// filter for only types that...
		.filter(type => {
			// are included in publishedTypeIDs...
			return publishedTypeIDs.includes(type.typeID);
		})
		// sort by typeID ascending
		.sort((typeA, typeB) => {
			return typeA.typeID - typeB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias industryActivityProbabilities
 * @description Returns an array of objects, each of which represents a different blueprint and activity. Taken from the SDE table, "industryActivityProbabilities."
 * @example [...{typeID, activityID, materialTypeID, quantity}]
 */
const industryActivityProbabilities = Object.freeze(
	getData(`industryActivityProbabilities`)
		// filter blueprints for only those...
		.filter(blueprint => {
			// which are included in publishedTypeIDs...
			return publishedTypeIDs.includes(blueprint.typeID);
		})
		// sort by typeID ascending
		.sort((blueprintA, blueprintB) => {
			return blueprintA.typeID - blueprintB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @constant
 * @alias industryActivitySkills
 * @description Compiles an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivitySkills."
 * @summary A list of specific activities and the skills required
 * @example [{ typeID, activityID, materialTypeID, quantity }, ...]
 */
const industryActivitySkills = Object.freeze(
	getData(`industryActivitySkills`)
		// filter blueprints for only those...
		.filter(blueprint => {
			// which are included in publishedTypeIDs...
			return publishedTypeIDs.includes(blueprint.typeID);
		})
		// sort by typeID ascending
		.sort((blueprintA, blueprintB) => {
			return blueprintA.typeID - blueprintB.typeID;
		})
);

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias typeName
 * @description Looks up a type by typeID and returns the corresponding typeName
 * @summary Returns typeName for a given typeID
 * @param {(string|number)} typeID 	- The ID number for a a particular item type
 * @return {string}									- The name of a particular type
 */
function typeName(typeID) {
	// search in invTypes...
	const type = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "typename" from entry if it is defined...
	return typeof type != `undefined`	? type.typeName
		: new Error(`typeName(): {${typeof type}} ${type}!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias groupID
 * @description Looks up a type by type ID and returns the corresponding group ID
 * @summary Returns groupID for a given typeID
 * @param {(string|number)} typeID - the ID number for a particular item type
 * @return {number} - ID of the group to which typeID belongs
 */
function groupID(typeID) {
	// search in invTypes...
	const group = invTypes.find(element => {
		// until a match is found...
		return element.typeID == typeID;
	});
	// return "typename" from entry if it is defined...
	return typeof group != `undefined` ? group.groupID
		: new Error(`groupID(): {${typeof group}} ${group}!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias groupName
 * @description Looks up a group by group ID and returns the corresponding group name
 * @summary Returns groupName for a given groupID
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
	return typeof group != `undefined` ? group.groupName
		: new Error(`groupName(): {${typeof group}} ${group}!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias marketGroupID
 * @description Looks up a type by type ID in invTypes and returns the corresponding market group ID
 * @summary Returns marketGroupID for a given typeID
 * @param {(string|number)} typeID - the ID number for a particular item type
 * @return {string} - The ID for the market group to which the given type belongs
 */
function marketGroupID(typeID) {
	const marketGroup = invTypes.find(element => {
		return element.typeID == typeID;
	});
	return typeof marketGroup != `undefined`	? marketGroup.marketGroupID
		: new Error(`marketGroupID(): {${typeof marketGroup}} ${marketGroupID}`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias marketGroupName
 * @description Looks up a market group by market group ID and returns the corresponding market group name
 * @summary Returns marketGroupName for a given marketGroupID
 * @param {(string|number)} marketGroupID - the ID number for a particular item market group
 * @return {string} - The name of the market group to which the given market group ID belongs
 */
function marketGroupName(marketGroupID) {
	const marketGroup = invMarketGroups.find(element => {
		return element.marketGroupID == marketGroupID;
	});
	return typeof marketGroup != `undefined`	? marketGroup.marketGroupName
		: new Error(`marketGroupName(): {${typeof marketGroup}} ${marketGroup})!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias categoryID
 * @description Looks up a group by group ID and returns the corresponding category ID
 * @summary Returns categoryID for given groupID
 * @param {(string|number)} groupID - the ID number for a particular item group
 * @return {string}
 */
function categoryID(groupID) {
	const category = invGroups.find(element => {
		return element.groupID == groupID;
	});
	return typeof category != `undefined` ? category.categoryID
		: new Error(`categoryID(): {${typeof category}} ${category}`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias categoryName
 * @description Looks up a category by category ID and returns the corresponding category name
 * @summary Returns categoryName for given categoryID
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
	return typeof category != `undefined`	? category.categoryName
		: new Error(`categoryName(): {${typeof category}} ${category}!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias activityName
 * @description Looks up a activity by activity ID and returns the corresponding activity name
 * @summary Returns activityName for given activityID
 * @param {(string|number)} activityID - the ID number for a particular industry activity
 * @return {string} - Name of the activity represented by the given activity ID
 */
function activityName(activityID) {
	// search in invTypes...
	const activity = industryActivities.find(element => {
		// until a match is found...
		return element.activityID == activityID;
	});
	// return "typename" from entry if it is defined...
	return typeof activity != 'undefined'	? activity.activityName
		: new Error(`activityName(): {${typeof activity}} ${activity}!`);
}

/** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
 * @function
 * @alias blueprints
 * @description Compiles all the data into an array of objects.
// TODO (developer) Add summary
 * @return {array}
 */
function blueprints() {
	return industryActivityProducts
		.reduce(
			// call the "reduce" array method to remove duplicates...
			(unique, item) =>
				// if "item" is already listed in "unique", then "unique" is left unchanged. Otherwise, add "item" to "unique"...
				unique.includes(item.productTypeID) ? unique : [...unique, item.productTypeID],
			// initial value for unique
			[]
		)
		.map(productTypeID => {
			const {
				activityID,
				typeID: blueprintTypeID,
				quantity
			} = industryActivityProducts.find(blueprint => {
				return blueprint.productTypeID == productTypeID;
			});
			const materials = industryActivityMaterials
				.filter(blueprint => {
					return (
						blueprint.typeID == blueprintTypeID && blueprint.activityID == activityID
					);
				})
				.map(blueprint => {
					return Object.freeze({
						quantity: blueprint.quantity,
						name: typeName(blueprint.materialTypeID),
						group: groupName(groupID(blueprint.materialTypeID)),
						marketGroup: marketGroupName(marketGroupID(blueprint.materialTypeID)),
						category: categoryName(categoryID(groupID(blueprint.materialTypeID))),
						imgUrl: `https://images.evetech.net/types/${blueprint.materialTypeID}/icon`
					});
				});

			const blueprint = Object.freeze({
				name: typeName(blueprintTypeID),
				group: groupName(groupID(blueprintTypeID)),
				marketGroup: marketGroupName(marketGroupID(blueprintTypeID)),
				category: categoryName(categoryID(groupID(blueprintTypeID))),
				imgUrl: `https://images.evetech.net/types/${blueprintTypeID}/bp`
			});

			const product = Object.freeze({
				name: typeName(productTypeID),
				group: groupName(groupID(productTypeID)),
				marketGroup: marketGroupName(marketGroupID(productTypeID)),
				category: categoryName(categoryID(groupID(productTypeID))),
				imgUrl: `https://images.evetech.net/types/${productTypeID}/icon`
			});

			const activityType = activityName(activityID);
			const time = industryActivity.find(activity => {
				return activity.typeID == blueprintTypeID && activity.activityID == activityID;
			}).time;
			const skills = industryActivitySkills
				.filter(activity => {
					return activity.typeID == blueprintTypeID && activity.activityID == activityID;
				})
				.map(activity => {
					return {
						level: activity.level,
						skillName: typeName(activity.skillID)
					};
				});
			const probability =
				typeof industryActivityProbabilities.find(activity => {
					return activity.typeID == blueprintTypeID && activity.activityID == activityID;
				}) != `undefined` ? probabilities.probability
					: 1;
			return Object.freeze({
				blueprint,
				product,
				quantity,
				activityType,
				materials,
				time,
				probability,
				skills
			});
		});
}
