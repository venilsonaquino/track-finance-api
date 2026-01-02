import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFromBeforeTo', async: false })
export class IsFromBeforeTo implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as { from?: string; to?: string };
    if (!obj.from || !obj.to) return true; // outras validações cuidarão do required

    const from = Date.parse(obj.from);
    const to = Date.parse(obj.to);
    if (Number.isNaN(from) || Number.isNaN(to)) return false;

    return from <= to;
  }

  defaultMessage(_: ValidationArguments) {
    return '"from" must be <= "to".';
  }
}
