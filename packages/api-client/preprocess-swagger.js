#!/usr/bin/env node

/**
 * This script preprocesses the Swagger/OpenAPI specification to prevent
 * duplicate enums from being generated in the first place.
 */

const fs = require("fs");
const path = require("path");

// Path to the swagger spec
const swaggerPath = path.resolve("./src/swagger.json");
const outputPath = path.resolve("./src/processed-swagger.json");

console.log(`Reading swagger spec from ${swaggerPath}...`);
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

// Find duplicated enums and merge them
const enumMap = new Map();

// Helper to get enum values from a schema property
function getEnumValues(schema) {
  if (schema && schema.enum) {
    return JSON.stringify(schema.enum.sort());
  }
  return null;
}

// First pass: collect all enums and their occurrences
Object.entries(swaggerSpec.components.schemas).forEach(([modelName, model]) => {
  if (model.properties) {
    Object.entries(model.properties).forEach(([propName, propSchema]) => {
      const enumValues = getEnumValues(propSchema);
      if (enumValues) {
        // Track this enum
        const key = `${modelName}.${propName}`;
        if (!enumMap.has(enumValues)) {
          enumMap.set(enumValues, [
            { modelName, propName, schema: propSchema },
          ]);
        } else {
          enumMap
            .get(enumValues)
            .push({ modelName, propName, schema: propSchema });
        }
      }
    });
  } else if (model.enum) {
    // Handle top-level enums
    const enumValues = JSON.stringify(model.enum.sort());
    if (!enumMap.has(enumValues)) {
      enumMap.set(enumValues, [{ modelName, schema: model }]);
    } else {
      enumMap.get(enumValues).push({ modelName, schema: model });
    }
  }
});

// Second pass: create standardized enum types and replace duplicates with $refs
for (const [values, occurrences] of enumMap.entries()) {
  if (occurrences.length > 1) {
    console.log(`Found duplicate enum with values ${values}:`);
    occurrences.forEach((occurrence) => {
      if (occurrence.propName) {
        console.log(`  - ${occurrence.modelName}.${occurrence.propName}`);
      } else {
        console.log(`  - ${occurrence.modelName}`);
      }
    });

    // Use the first occurrence as the canonical one
    const canonical = occurrences[0];
    const enumValues = JSON.parse(values);

    // For each subsequent occurrence, update it to use enumName if it doesn't have one
    for (let i = 0; i < occurrences.length; i++) {
      const occurrence = occurrences[i];

      if (occurrence.propName) {
        // It's a property in a model
        const propSchema =
          swaggerSpec.components.schemas[occurrence.modelName].properties[
            occurrence.propName
          ];

        // If it doesn't have an enumName, add it
        if (!propSchema.enumName && i > 0) {
          // Use the first occurrence's enum name if it has one
          if (canonical.propName && canonical.schema.enumName) {
            propSchema.enumName = canonical.schema.enumName;
          } else if (!canonical.propName) {
            // Use the top-level enum name
            propSchema.enumName = canonical.modelName;
          }
        }
      }
    }
  }
}

// Update paths to eliminate duplicate parameter enums
if (swaggerSpec.paths) {
  // Create a map of unique parameter definitions
  const uniqueParameters = {};

  for (const path in swaggerSpec.paths) {
    const pathItem = swaggerSpec.paths[path];

    for (const method in pathItem) {
      if (method === "parameters") continue;

      const operation = pathItem[method];

      if (operation.parameters) {
        operation.parameters = operation.parameters.map((param) => {
          // Only process parameters with enums
          if (param.schema && param.schema.enum) {
            const enumKey = JSON.stringify(param.schema.enum.sort());
            const paramKey = `${param.name}:${param.in}:${enumKey}`;

            if (!uniqueParameters[paramKey]) {
              uniqueParameters[paramKey] = param;
              return param;
            } else {
              // Use reference to the first occurrence
              return uniqueParameters[paramKey];
            }
          }
          return param;
        });
      }
    }
  }
}

// Write the processed spec
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`Wrote processed swagger spec to ${outputPath}`);
