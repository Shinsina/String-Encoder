import fetch from 'node-fetch';
import fs from 'fs';

const resolveFieldTypes = (key, rootLevelProperty) => {
  const typeResolution = {};
  if (typeof rootLevelProperty === 'object') {
    typeResolution[key] = {};
    Object.keys(rootLevelProperty).forEach((property) => {
      if (typeof rootLevelProperty[property] === 'number') {
          const isInteger = rootLevelProperty[property] % 1 === 0 ? true : false;
          if (isInteger) typeResolution[key][property] = { type: 'GraphQLInt' };
          else typeResolution[key][property] = { type: 'GraphQLFloat' };
      } else if (typeof rootLevelProperty[property] === 'string') {
        typeResolution[key][property] = { type: 'GraphQLString' };
      } else if (typeof rootLevelProperty[property] === 'boolean') {
        typeResolution[key][property] = { type: 'GraphQLBoolean' };
      } else {
        console.log(`Data on field ${key} contains non-primitive data types!`)
      }
    })
  } else if (typeof rootLevelProperty === 'number') {
      const isInteger = rootLevelProperty % 1 === 0 ? true : false;
      if (isInteger) typeResolution[key] = { type: 'GraphQLInt' };
      else typeResolution[key] = { type: 'GraphQLFloat' };
    } else if (typeof rootLevelProperty === 'string') {
      typeResolution[key] = { type: 'GraphQLString' };
    } else if (typeof rootLevelProperty[property] === 'boolean') {
      typeResolution[key] = { type: 'GraphQLBoolean' };
    } else {
      console.log(`Data on field ${key} contains non-primitive data types!`)
    }
  return typeResolution
}

const main = async () => {
  const url = 'https://itunes.apple.com/lookup?id=449513466&entity=song&limit=135'
  const response = await fetch(url);
  const jsonRes = await response.json();
  const jsonFieldDefinitions = [];
  let jsonTypeDefinition = { listFields: [] };
  Object.keys(jsonRes).forEach((key) => {
    if (Array.isArray(jsonRes[key])) {
      const arrayLength = jsonRes[key].length;
      const randomIndex = Math.ceil(Math.random() * arrayLength);
      let isArray = Array.isArray(jsonRes[key][randomIndex]);
      let currentArray = isArray ? jsonRes[key][randomIndex] : null;
      if (currentArray) {
        // Essentially discourage use of APIs that returns an array of arrays
        // This will flatten them so as to return 1 field of whatever type the innermost element is
        while (isArray) {
          const arrayInnerLength = currentArray.length;
          const randomInnerIndex = Math.ceil(Math.random() * arrayInnerLength)
          currentArray = currentArray[randomInnerIndex];
          isArray = Array.isArray(currentArray[randomInnerIndex]);
        }
        const finalArrayInnerLength = currentArray.length;
        const finalRandomInnerIndex = Math.ceil(Math.random() * finalArrayInnerLength);
        jsonFieldDefinitions.push(resolveFieldTypes(key, currentArray[finalRandomInnerIndex]));
        jsonTypeDefinition.listFields.push(key);
      } else {
        jsonFieldDefinitions.push(resolveFieldTypes(key, jsonRes[key][randomIndex]));
        jsonTypeDefinition.listFields.push(key);
      }
    } else {
      jsonFieldDefinitions.push(resolveFieldTypes(key, jsonRes[key]));
    }
  });

  jsonFieldDefinitions.forEach((fieldDef) => {
    jsonTypeDefinition = {...jsonTypeDefinition, ...fieldDef}
  });

  const overallTypeDef = 'const OverallDefinitionType = new GraphQLObjectType ({ \n name: \'OverallDefinition\',\n'
  const overallTypeDefs = [];
  const typeFieldDef = '  fields: () => ({ \n'
  const individualFieldDefs = {};
  const typeDefs = [];
  jsonTypeDefinition.listFields.forEach((listField) => {
    if (typeof jsonTypeDefinition[listField] === 'object') {
      individualFieldDefs[listField] = [];
      Object.keys(jsonTypeDefinition[listField]).forEach((field) => {
        const { type } = jsonTypeDefinition[listField][field];
        if (type) individualFieldDefs[listField].push(`    ${field}: { type: ${type} },\n`)
      });
      if (individualFieldDefs[listField].length) individualFieldDefs[listField] = individualFieldDefs[listField].join('').concat('  })');
      const typeDef = `const ${listField}Type = new GraphQLObjectType ({ \n  name: '${listField}',\n${typeFieldDef.concat(individualFieldDefs[listField])}\n});`;
      typeDefs.push(typeDef);
      overallTypeDefs.push(`    ${listField}: { type: new GraphQLList(${listField}Type) },\n`);
      delete jsonTypeDefinition[listField];
    }
  });
  delete jsonTypeDefinition.listFields;
  Object.keys(jsonTypeDefinition).forEach((field) => {
    overallTypeDefs.push(`    ${field}: { type: ${jsonTypeDefinition[field].type} },\n`)
    delete jsonTypeDefinition[field];
  });

  const finalOverallTypeDef = overallTypeDef.concat(`${typeFieldDef.concat(overallTypeDefs.join('').concat('  })'))}\n});`);

  const query = `const query = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      overalldefinition: {
        type: OverallDefinitionType,
        args: { url: { type: GraphQLString } },
        resolve(_, args) {
          return fetch(args.url).then((data) => data.json());
        }
      }
    }
  })`;
  const exportDefault = 'export default new GraphQLSchema({ query })'
  fs.writeFileSync('./test.js', `import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLObjectType, GraphQLList, GraphQLSchema } from 'graphql';
  import fetch from 'node-fetch';

  ${typeDefs.join('\n')}

  ${finalOverallTypeDef}

  ${query}

  ${exportDefault}
  `)
}

main()
