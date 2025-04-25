# EZPG Swagger Decorators Style Guide

This guide outlines how to maintain consistent Swagger decorators in the EZPG project. Following these guidelines ensures that client-side types can be properly generated from the backend code.

## DTO Decorators

### Required Properties

```typescript
@ApiProperty({
  description: 'Clear description of the property',
  example: 'exampleValue',  // Provide a realistic example
  required: true,  // Explicitly mark required properties
  // Add other constraints as appropriate:
  minLength: 3,
  maxLength: 50,
  minimum: 0,
  maximum: 100,
  type: Number, // Explicitly specify type for non-primitive types
})
@IsString() // Validation decorators should follow Swagger decorators
@IsNotEmpty()
propertyName: string;
```

### Optional Properties

```typescript
@ApiPropertyOptional({
  description: 'Clear description of the property',
  example: 'exampleValue',
  required: false, // Optional but helpful for clarity
  default: 'defaultValue', // If there's a default
})
@IsOptional()
@IsString()
propertyName?: string = 'defaultValue';
```

### Enum Properties

```typescript
@ApiPropertyOptional({
  enum: StatusEnum,
  description: 'Status filter',
  example: StatusEnum.ACTIVE,
  required: false,
})
@IsOptional()
@IsEnum(StatusEnum)
status?: StatusEnum;
```

## Controller Decorators

### Controller Class

```typescript
@ApiTags("Feature Name - Resource") // Group logically in Swagger UI
@ApiBearerAuth("jwt-bearer-auth") // If authentication is required
@Controller("path/to/resource")
export class ResourceController {
  // ...
}
```

### Endpoints

```typescript
@Post()
@ApiOperation({
  summary: 'Short description of action',
  description: 'More detailed description of what this endpoint does',
  operationId: 'uniqueOperationId' // Optional but useful for client generation
})
@ApiBody({ type: CreateResourceDto }) // Specify the exact DTO for request body
@ApiResponse({
  status: 201,
  description: 'Success response description',
  type: ResourceResponseDto // Reference to a response DTO or schema
})
@ApiResponse({ status: 400, description: 'Validation error or other bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
create(@Body() createDto: CreateResourceDto) {
  // ...
}
```

### Query Parameters

```typescript
@Get()
@ApiOperation({ summary: 'List resources', description: 'Retrieves paginated resources' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
@ApiQuery({ name: 'status', required: false, enum: StatusEnum, description: 'Filter by status' })
@ApiResponse({ status: 200, description: 'Success', type: PaginatedResourcesDto })
findAll(@Query() queryDto: ResourceQueryDto) {
  // ...
}
```

### Path Parameters

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get resource details', description: 'Retrieves a specific resource by ID' })
@ApiParam({ name: 'id', description: 'Resource unique identifier', example: '123' })
@ApiResponse({ status: 200, description: 'Success', type: ResourceDto })
@ApiResponse({ status: 404, description: 'Resource not found' })
findOne(@Param('id') id: string) {
  // ...
}
```

## Response Types

For proper client generation, define response DTOs:

```typescript
// resource.dto.ts
export class ResourceDto {
  @ApiProperty({ description: "Unique identifier", example: "123" })
  id: string;

  @ApiProperty({ description: "Resource name", example: "Example Resource" })
  name: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2023-06-15T10:30:00Z",
    type: String, // Use String for date-time strings
  })
  createdAt: string;
}
```

And for paginated responses:

```typescript
// paginated-response.dto.ts
export class PaginatedResourcesDto {
  @ApiProperty({ type: [ResourceDto] })
  data: ResourceDto[];

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  currentPage: number;
}
```

## Generating Client Types

Run the type generation script whenever DTOs or controllers are updated:

```bash
npm run generate-types
```

This will parse Swagger decorators and create TypeScript interfaces in the `packages/types/src` directory for use by client applications.

## Common Issues

- **Missing descriptions**: All properties should have clear descriptions.
- **Missing examples**: Include realistic examples for properties.
- **Missing response types**: Define and reference response DTOs for ApiResponse.
- **Inconsistent enums**: Use the same enum approach across all DTOs.
- **Inadequate validation**: Ensure validation decorators match Swagger constraints.

Following these guidelines ensures a consistent, well-documented API that simplifies client development.
