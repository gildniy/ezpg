import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { Transform } from "class-transformer";

@ValidatorConstraint({ name: "isDecimal", async: false })
export class IsDecimalConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    if (value === null || value === undefined) {
      return true;
    }
    return !isNaN(Number(value));
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid decimal number`;
  }
}

export function IsValidDecimal(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDecimalConstraint,
    });
  };
}

// Decorator to transform string input to Decimal and validate
export function TransformDecimal(validationOptions?: ValidationOptions) {
  return function (target: object, propertyKey: string): void {
    // Transform string to Decimal object before validation/service
    Transform(({ value }) => {
      if (value === null || value === undefined) {
        return null;
      }
      return Number(value);
    })(target, propertyKey);
    // Apply validation
    IsValidDecimal(validationOptions)(target, propertyKey);
  };
}
