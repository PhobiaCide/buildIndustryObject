"use strict";
/**
 * @file
 * @alias buildIndustryObject.js
 * @version 2.0.0
 * @summary Builds an array of objects, each of which contains relevant industry data related to a single blueprint
 * @description fetches numerous data from the Eve Online Static Data Export, filters it, and returns an array of objects, each of which contains the blueprint info, product info, quantity produced, activity type, materials cost, build time, base probability, and required skills for a single blueprint
 * @author PhobiaCide
 * @copyright © 𝟸𝟶𝟸𝟸 𝙰𝚗𝚍𝚛𝚎𝚠 𝙰𝚖𝚊𝚜𝚘𝚗
 * @license MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const FILE_NAME = `
█▀▀▄ █░░█ ░▀░ █░░ █▀▀▄ ░▀░ █▀▀▄ █▀▀▄ █░░█ █▀▀█ █▀▀▄ ░░▀ █▀▀ █▀▀ ▀▀█▀▀ ░ ░░▀ █▀▀
█▀▀▄ █░░█ ▀█▀ █░░ █░░█ ▀█▀ █░░█ █░░█ █▄▄█ █░░█ █▀▀▄ ░░█ █▀▀ █░░ ░░█░░ ▄ ░░█ ▀▀█
▀▀▀░ ░▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀░ ▀▀▀ ▀░░▀ ▀▀▀░ ▄▄▄█ ▀▀▀▀ ▀▀▀░ █▄█ ▀▀▀ ▀▀▀ ░░▀░░ █ █▄█ ▀▀▀`;

/**
 * @constant
 * @alias industryActivities
 * @summary An array of objects, each of which represents a different industry activity width:  corresponding ID
 * @description industryActivities is a small collection of data structured as an array of objects, each of which represents a different industrial activity - properties are "activityID" and "activityName"
 * @property {number} activityID - The ID number of a particular industry activity
 * @property {string} activityName - The name of a particular industry activity
 */
const industryActivities = Object.freeze([
  Object.freeze({
    activityID: 1,
    activityName: 'Manufacturing'
  }),
  Object.freeze({
    activityID: 3,
    activityName: 'Researching Time Efficiency'
  }),
  Object.freeze({
    activityID: 4,
    activityName: 'Researching Material Efficiency'
  }),
  Object.freeze({
    activityID: 5,
    activityName: 'Copying'
  }),
  Object.freeze({
    activityID: 8,
    activityName: 'Invention'
  }),
  Object.freeze({
    activityID: 9,
    activityName: 'Reactions'
  })
]);

/**
 * @constant
 * @alias staticData
 * @summary Lists all SDE conversion tables and their addresses
 * @description An array of objects, each of which contains a name and address to an Eve Online Static Data Export .JSON conversion
 */
const staticData = Object.freeze(
  JSON.parse(
    UrlFetchApp.fetch(`https://sde.zzeve.com/tables.json`).getContentText()
  )
);

/**
 * @constant
 * @alias invMarketGroups
 * @summary Lists all market group lookup data
 * @description Compiles an array of objects, each of which represents a different item. Taken from the SDE table, "invMarketGroups."
 * @example [{ marketGroupID, marketGroupName, description }, ...]
 * @property {(number|string)} marketGroupID - Identification number for a particular market group
 * @property {string} marketGroupName - Name of a particular market group
 * @property {string} description - Description of a particular market group
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
);

/**
 * @constant
 * @alias invCategories
 * @summary Lists Category lookup data
 * @description Compiles an array of objects, each of which represents a different item category, the parent of group. Taken from the SDE table, "invCategories", the list is filtered for only published entries.
 * @example [{ categoryID, categoryName }, ...]
 * @property {(number|string)} categoryID - Identification number for the group to which a particular type belongs
 * @property {string} categoryName - Name of a particular group
 */
const invCategories = Object.freeze(
  getData(`invCategories`)
    // filter for only categories where...
    .filter(category => {
      // "published" is not zero...
      return category.published != 0;
    })
    // map for each category...
    .map(category => {
      // return an object with these properties...
      const { categoryID, categoryName } = category;
      return Object.freeze({
        categoryID,
        categoryName
      });
    })
);

/**
 * @constant
 * @alias invGroups
 * @summary Lists all group lookup data
 * @description Compiles an array of objects, each of which represents a different item group, the parent of type. Taken from the SDE table, "invGroups", the list is filtered for only published entries.
 * @example [{ groupID, groupName, categoryID }, ...]
 * @property {(number|string)} groupID - Identification number for the group to which a particular type belongs
 * @property {string} groupName - Name of a particular group
 * @property {(number|string)} categoryID - Identification number for a category to which a particular group belongs
 */
const invGroups = Object.freeze(
  getData(`invGroups`)
    // filter for only groups where...
    .filter(group => {
      // "published" is not zero...
      return group.published != 0;
    })
    // map for each group...
    .map(group => {
      // return an object with these attributes...
      const { groupID, groupName, categoryID } = group;
      return Object.freeze({
        groupID,
        groupName,
        categoryID
      });
    })
);

/**
 * @constant
 * @alias invTypes
 * @summary	Lists all type lookup data
 * @description Compiles an array of objects, each of which represents a different item. Taken from the SDE table, "invTypes", the list is filtered for only published entries and only certain attributes are mapped.
 * @example	[{ typeID, typeName, description, groupID, marketGroupID }, ...]
 * @property {(string|number)} typeID - Identification number for a particular type
 * @property {string} typeName - Name of a particular type
 * @property {string} description - This is displayed in-game in the show info panel on the "description" tab
 * @property {(string|number)} groupID - Identification number for the group to which a particular type belongs
 * @property {(string|number)} marketGroupID - Identification number for the market group to which a particular type belongs
 */
const invTypes = Object.freeze(
  getData(`invTypes`)
    // filter for types where...
    .filter(type => {
      // "published" is not zero...
      return type.published != 0;
    })
    // map for each type...
    .map(type => {
      // return an object with these properties...
      const { typeID, groupID, typeName, description, marketGroupID } = type;
      return Object.freeze({
        typeID,
        groupID,
        typeName,
        description,
        marketGroupID
      });
    })
);

/**
 * @constant
 * @alias publishedTypeIDs
 * @summary A list of all the published type IDs
 * @description Takes invTypes and takes the typeID from each entry and returns them all in an array
 */
const publishedTypeIDs = invTypes.map(entry => entry.typeID);

/**
 * @constant
 * @alias filters
 */
const filters = {
  unpublished: (type) => {
    const { typeID } = type;
    return publishedTypeIDs.includes(typeID);
  }
};

/**
 * @constant
 * @alias industryActivityMaterials
 * @summary Lists all materials for a particular blueprint and activity
 * @description Returns an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivityMaterials", the list is filtered for only published entries.
 * @example [{ typeID, activityID, materialTypeID, quantity }, ...]
 */
const industryActivityMaterials = Object.freeze(
  getData(`industryActivityMaterials`)
    // filter out unpublished items...
    .filter(filters.unpublished)
);

/**
 * @constant
 * @alias industryActivity
 * @summary Lists time cost for each blueprint and activity combination
 * @description Returns an array of objects, each of which represents a different item. Taken from the SDE table, "industryActivities."
 * @example [{ typeID, activityID, time }, ...]
 */
const industryActivity = Object.freeze(
  getData(`industryActivity`)
    // filter out unpublished items...
    .filter(filters.unpublished)
);

/**
 * @constant
 * @alias industryActivityProbabilities
 * @summary Lists success chance for each blueprint and activity combination
 * @description Returns an array of objects, each of which represents a different blueprint and activity. Taken from the SDE table, "industryActivityProbabilities."
 * @example [{ typeID, activityID, materialTypeID, quantity }, ...]
 */
const industryActivityProbabilities = Object.freeze(
  getData(`industryActivityProbabilities`)
    // filter out unpublished items...
    .filter(filters.unpublished)
);

/**
 * @constant
 * @alias industryActivitySkills
 * @summary A list of specific activities and the skills required
 * @description Compiles an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivitySkills."
 * @example [{ typeID, activityID, materialTypeID, quantity }, ...]
 */
const industryActivitySkills = Object.freeze(
  // get industryActivitySkills
  getData(`industryActivitySkills`)
    // filter out unpublished items...
    .filter(filters.unpublished)
);

/**
 * @constant
 * @alias industryActivityProducts
 * @summary Lists product data for a each blueprint and activity combination
 * @description Returns an array of objects, each of which represents a different blueprint. Taken from the SDE table, "industryActivityProducts", the list is filtered for only published entries and only certain attributes are mapped.
 * @example [{ typeID, typeName, productTypeID, quantity }, ...]
 */
const industryActivityProducts = Object.freeze(
  getData(`industryActivityProducts`)
    // filter blueprints for only those...
    .filter(blueprint => {
      const { typeID, productTypeID, activityID } = blueprint;
      return (
        // that are included in publishedTypeIDs AND...
        publishedTypeIDs.includes(typeID) &&
        // whose products are included in publishedTypeIDs AND...
        publishedTypeIDs.includes(productTypeID) &&
        // whose activityID is either 1 OR 9...
        (activityID == 1 || activityID == 9)
      );
    })
    // map for each blueprint...
    .map(blueprint => {
      // return an object with these properties...
      const { typeID, quantity, activityID, productTypeID } = blueprint;
      return Object.freeze({
        typeID,
        quantity,
        activityID,
        productTypeID
      });
    })
    // sort by typeID ascending...
    .sort((blueprintA, blueprintB) => {
      return blueprintA.typeID - blueprintB.typeID;
    })
);

/**
 * @constant
 * @alias lookup
 */
const lookup = {
  /**
   * @method
   * @alias typeName
   * @summary Returns typeName for a given typeID
   * @description Searches for a type by typeID and returns the corresponding typeName
   * @throws returns an error if "type" is undefined
   * @param {(string|number)} typeID - The ID number for a a particular item type
   * @return {string} - The name of a particular type
   */
  typeName: typeID => {
    // search in invTypes...
    const type = invTypes.find(type => {
      // for the type data whose ID matches typeID...
      return type.typeID == typeID;
    });
    // return "typename" from entry if it is defined...
    return typeof type != `undefined` ? type.typeName : new Error(`typeName(): {${typeof type}} ${type}!`);
  },
  /**
   * @method
   * @alias groupID
   * @summary Returns groupID for a given typeID
   * @description Searches for a type by type ID and returns the corresponding group ID
   * @throws returns an error if "group" is undefined
   * @param {(string|number)} typeID - the ID number for a particular item type
   * @return {number} - ID of the group to which typeID belongs
   */
  groupID: typeID => {
    // search in invTypes...
    const group = invTypes.find(type => {
      // for the type data whose ID matches typeID...
      return type.typeID == typeID;
    });
    // return "typename" from entry if it is defined...
    return typeof group != `undefined` ? group.groupID : new Error(`groupID(): {${typeof group}} ${group}!`);
  },

  /**
   * @method
   * @alias groupName
   * @summary Returns groupName for a given groupID
   * @description Searches for a group by group ID and returns the corresponding group name
   * @throws returns an error if "group" is undefined
   * @param {(string|number)} groupID - the ID number for a a particular item group
   * @return {string} - The name of the group whose ID matches "groupID"
   */
  groupName: groupID => {
    // search in invGroups...
    const group = invGroups.find(group => {
      // for group data whose ID matches "groupID"...
      return group.groupID == groupID;
    });
    // return "groupName" from group if it is defined...
    return typeof group != `undefined` ? group.groupName
      // if not defined, return an error...
      : new Error(`groupName(): {${typeof group}} ${group}!`);
  },

  /**
   * @method
   * @alias marketGroupID
   * @summary Returns "marketGroupID" for a given "typeID"
   * @description Searches for a type by type ID in invTypes and if a match is defined, returns the corresponding market group ID
   * @throws If "marketGroup" is undefined, the function will return an error
   * @param {(string|number)} typeID - the ID number for a particular item type
   * @return {string} - The ID for the market group to which the given type belongs
   */
  marketGroupID: typeID => {
    // search in invTypes...
    const marketGroup = invTypes.find(type => {
      // for a type data whose ID matches "typeID"...
      return type.typeID == typeID;
    });
    // return "marketGroupID" from  "marketGroup" if defined...
    return typeof marketGroup != `undefined` ? marketGroup.marketGroupID
      // if not defined, return an error...
      : new Error(
        `marketGroupID(): {${typeof marketGroup}} ${marketGroup}`
      );
  },

  /**
   * @method
   * @alias marketGroupName
   * @summary Returns "marketGroupName" for a given "marketGroupID"
   * @description Searches for a market group by market group ID and if a match is defined, returns the corresponding market group name
   * @throws If "marketGroup" is undefined, the function will return an error
   * @param {(string|number)} marketGroupID - the ID number for a particular market group
   * @return {string} - The name of the market group whose ID matches "marketGroupID", if defined
   */
  marketGroupName: marketGroupID => {
    // search in "invMarketGroups"...
    const marketGroup = invMarketGroups.find(marketGroup => {
      // for the market group data whose ID matches "marketGroupID"...
      return marketGroup.marketGroupID == marketGroupID;
    });
    // return "marketGroupName" of "marketGroup" if defined...
    return typeof marketGroup != `undefined` ? marketGroup.marketGroupName
      // if not defined, return an error...
      : new Error(
        `marketGroupName(): {${typeof marketGroup}} ${marketGroup})!`
      );
  },

  /**
   * @method
   * @alias categoryID
   * @summary Returns "categoryID" of the category to which the group belongs whose ID matches the given "groupID"
   * @description Searches for a group by group ID and if a match is defined, returns the corresponding category ID
   * @throws If "group" is undefined, the function will return an error
   * @param {(string|number)} groupID - The ID number for a particular group
   * @return {string} - The ID of the category of the group whose ID matches "groupID", if defined
   */
  categoryID: groupID => {
    // search in "invGroups"...
    const group = invGroups.find(group => {
      // for the group data whose ID matches "groupID"...
      return group.groupID == groupID;
    });
    // return "categoryID" of "group" if defined...
    return typeof group != `undefined` ? group.categoryID
      // if not defined, return an error...
      : new Error(`categoryID(): {${typeof group}} ${group}`);
  },

  /**
   * @method
   * @alias categoryName
   * @summary Returns "categoryName" of the category whose ID matches the given "categoryID"
   * @description Searches "invCategories" for the category whose ID matches the given "categoryID". If such a match is defined, returns the corresponding name for that particular category.
   * @throws If "category" is undefined, the function will return an error
   * @param {(string|number)} categoryID - ID number for a particular category
   * @return {string} - The name of the category whose ID matches "categoryID", if defined.
   */
  categoryName: categoryID => {
    // search in invCategories...
    const category = invCategories.find(category => {
      // for the category data whose ID matches "categoryID"...
      return category.categoryID == categoryID;
    });
    // return "categoryName" of "category" if defined...
    return typeof category != `undefined` ? category.categoryName
      // if not defined, return an error...
      : new Error(`categoryName(): {${typeof category}} ${category}!`)
      ;
  },

  /**
   * @method
   * @alias activityName
   * @summary Returns "activityName" of the activity whose ID matches the given "activityID"
   * @description Searches "industryActivities" for the activity whose ID matches the given "activityID". If such a match is defined, returns the corresponding name for that particular activity.
   * @throws If "activity" is undefined, the function will return an error.
   * @param {(string|number)} activityID - The ID number for a particular industry activity
   * @return {string} - The activity name of "activity", if defined
   */
  activityName: activityID => {
    // search in industryActivities...
    const activity = industryActivities.find(activity => {
      // for the activity data whose ID matches "activityID"...
      return activity.activityID == activityID;
    });
    // return "typename" from "activity" if it is defined...
    return typeof activity != 'undefined' ? activity.activityName
      // if not defined, return an error...
      : new Error(`activityName(): {${typeof activity}} ${activity}!`)
      ;
  }
};

/**
  * @function
  * @alias getData
  * @summary Fetches .json for the given SDE conversion by given name and parses it
  * @description Fetches the given Eve Online Static Data Export .JSON conversion and returns the parsed JSON
  * @throws Will throw error if "tableName" is not defined
  * @param {object} options - An object containing properties which are parameters for getData
  * @property {(string|boolean)} [options.tableName = false] - The name of the requested .JSON conversion file
  * @property {(string|boolean)}  [options.tableAddress = false] - The address of the desired .JSON conversion file
  * @return {object} - The requested data
  */
function getData(tableName = false) {
  return !tableName ? new Error(`getData, Error: tableName in not defined!`)
    : JSON.parse(
      UrlFetchApp.fetch(
        staticData.find(table => table.name == tableName).href
      ).getContentText()
    );
}

/**
 * @function
 * @alias materialData
 * @summary builds an object from predefined data for the given "typeID"
 * @description By performing a series of lookup functions, acquires data referring to type, group, category, and market group name of the given type ID and assembles them into an object.
 * @param {(number|string)} typeID - ID for a given type
 * @return {object} - the assembled data
 */
function materialData(typeID) {

  const name = lookup.typeName(typeID);
  const groupID = lookup.groupID(typeID);
  const group = lookup.groupName(groupID);
  const category = lookup.categoryName(lookup.categoryID(groupID));
  const marketGroup = lookup.marketGroupName(lookup.marketGroupID(typeID));
  // if market group is undefined, skip it.
  return marketGroup != `undefined` ? Object.freeze({
    name,
    group,
    typeID,
    category,
    marketGroup
  }) : Object.freeze({
    name,
    group,
    typeID,
    category
  });

}

/**
 * @function
 * @alias blueprints
 * @summary Compiles all the data into single array of objects.
 * @description Digests multiple arrays of objects, and after some destructuring, assembles and returns an array of objects, each of which contains the blueprint info, product info, quantity produced, activity type, materials cost, build time, base probability, and required skills for a single blueprint.
 * @return {array} - An array of objects, each of which contains information on a single blueprint
 */
function blueprints() {
  return (
    // call the "reduce" array method to remove duplicates...
    industryActivityProducts
      .reduce(
        // if "item" is already listed in "unique"... // then "unique" is left unchanged...
        (uniqueList, item) => uniqueList.includes(item.productTypeID) ? uniqueList
          // otherwise, add "item" to "unique"...
          : [...uniqueList, item.productTypeID],
        // initial value for unique
        []
      )
      .map(productTypeID => {
        // get the variables activityID, blueprintTypeID, and quantity from...
        const { quantity, activityID, typeID: blueprintTypeID } =
          // the blueprint found in industryActivityProducts...
          industryActivityProducts.find(blueprint => {
            // whose product has an ID which matches productTypeID...
            return blueprint.productTypeID == productTypeID;
          });

        /**
         * @constant
         * @alias materials
         * @summary all the materials that match the current blueprint
         */
        const materials = industryActivityMaterials
          .filter(blueprint => {
            return (
              blueprint.typeID == blueprintTypeID &&
              blueprint.activityID == activityID
            );
          })
          .map(material => {
            const { materialTypeID, quantity } = material;
            return Object.assign(
              { quantity },
              materialData(materialTypeID)
            );
          });

        /**
         * @constant
         * @alias time
         * @summary the base time to run the current job in seconds
         */
        const { time } = industryActivity.find(activity => {
          return (
            activity.typeID == blueprintTypeID && activity.activityID == activityID
          );
        });

        /**
         * @constant
         * @alias skills
         * @summary skills required to run the current job
         */
        const skills = industryActivitySkills
          .filter(activity => {
            return (
              activity.typeID == blueprintTypeID &&
              activity.activityID == activityID
            );
          })
          .map(activity => {
            return {
              level: parseInt(activity.level),
              skill: lookup.typeName(activity.skillID)
            };
          });

        /**
         * @constant
         * @alias probabilities
         * @summary parent of "probability"
         */
        const probabilities =
          industryActivityProbabilities.find(activity => {
            return (
              activity.typeID == blueprintTypeID && activity.activityID == activityID
            );
          });

        /**
         * @constant
         * @alias probability
         * @summary the chance of success of the current job
         */
        const probability = typeof probabilities != `undefined` ? parseFloat(probabilities.probability)
          : 1
          ;

        /**
         * @constant
         * @alias activityType
         * @summary the activity of the current blueprint
         */
        const activityType = lookup.activityName(activityID);

        /**
         * @constant
         * @alias blueprint
         * @summary group, category, and market group data for current blueprint
         */
        const blueprint = materialData(blueprintTypeID);

        return Object.freeze(
          Object.assign(
            {
              time,
              skills,
              quantity,
              blueprint,
              materials,
              probability,
              activityType
            },
            materialData(productTypeID)
          )
        );
      }
      )
  );
}
