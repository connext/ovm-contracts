export declare const ReadonlyOptionalModifier: unique symbol;
export declare const OptionalModifier: unique symbol;
export declare const ReadonlyModifier: unique symbol;
export declare type TReadonlyOptional<T extends TSchema> = T & {
    modifier: typeof ReadonlyOptionalModifier;
};
export declare type TOptional<T extends TSchema> = T & {
    modifier: typeof OptionalModifier;
};
export declare type TReadonly<T extends TSchema> = T & {
    modifier: typeof ReadonlyModifier;
};
export declare type TModifier = TReadonlyOptional<TSchema> | TOptional<TSchema> | TReadonly<TSchema>;
export declare const UnionKind: unique symbol;
export declare const IntersectKind: unique symbol;
export declare const TupleKind: unique symbol;
export declare const ObjectKind: unique symbol;
export declare const DictKind: unique symbol;
export declare const ArrayKind: unique symbol;
export declare const EnumKind: unique symbol;
export declare const LiteralKind: unique symbol;
export declare const StringKind: unique symbol;
export declare const NumberKind: unique symbol;
export declare const IntegerKind: unique symbol;
export declare const BooleanKind: unique symbol;
export declare const NullKind: unique symbol;
export declare const UnknownKind: unique symbol;
export declare const AnyKind: unique symbol;
export interface CustomOptions {
    title?: string;
    description?: string;
    default?: any;
    examples?: any;
    [prop: string]: any;
}
export declare type StringFormatOption = 'date-time' | 'time' | 'date' | 'email' | 'idn-email' | 'hostname' | 'idn-hostname' | 'ipv4' | 'ipv6' | 'uri' | 'uri-reference' | 'iri' | 'uuid' | 'iri-reference' | 'uri-template' | 'json-pointer' | 'relative-json-pointer' | 'regex';
export declare type StringOptions<TFormat extends string> = {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: TFormat;
    contentEncoding?: '7bit' | '8bit' | 'binary' | 'quoted-printable' | 'base64';
    contentMediaType?: string;
} & CustomOptions;
export declare type ArrayOptions = {
    uniqueItems?: boolean;
    minItems?: number;
    maxItems?: number;
} & CustomOptions;
export declare type NumberOptions = {
    exclusiveMaximum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    minimum?: number;
    multipleOf?: number;
} & CustomOptions;
export declare type DictOptions = {
    minProperties?: number;
    maxProperties?: number;
} & CustomOptions;
export declare type TEnumType = Record<string, string | number>;
export declare type TKey = string | number;
export declare type TValue = string | number | boolean;
export declare type TIntersect<T extends TSchema[]> = {
    kind: typeof IntersectKind;
    allOf: [...T];
} & CustomOptions;
export declare type TUnion<T extends TSchema[]> = {
    kind: typeof UnionKind;
    anyOf: [...T];
} & CustomOptions;
export declare type TTuple<T extends TSchema[]> = {
    kind: typeof TupleKind;
    type: 'array';
    items: [...T];
    additionalItems: false;
    minItems: number;
    maxItems: number;
} & CustomOptions;
export declare type TProperties = {
    [key: string]: TSchema;
};
export declare type TObject<T extends TProperties> = {
    kind: typeof ObjectKind;
    type: 'object';
    properties: T;
    required?: string[];
} & CustomOptions;
export declare type TDict<T extends TSchema> = {
    kind: typeof DictKind;
    type: 'object';
    additionalProperties: T;
} & DictOptions;
export declare type TArray<T extends TSchema> = {
    kind: typeof ArrayKind;
    type: 'array';
    items: T;
} & ArrayOptions;
export declare type TLiteral<T extends TValue> = {
    kind: typeof LiteralKind;
    type: 'string' | 'number' | 'boolean';
    enum: [T];
} & CustomOptions;
export declare type TEnum<T extends TKey> = {
    kind: typeof EnumKind;
    enum: T[];
} & CustomOptions;
export declare type TString = {
    kind: typeof StringKind;
    type: 'string';
} & StringOptions<string>;
export declare type TNumber = {
    kind: typeof NumberKind;
    type: 'number';
} & NumberOptions;
export declare type TInteger = {
    kind: typeof IntegerKind;
    type: 'integer';
} & NumberOptions;
export declare type TBoolean = {
    kind: typeof BooleanKind;
    type: 'boolean';
} & CustomOptions;
export declare type TNull = {
    kind: typeof NullKind;
    type: 'null';
} & CustomOptions;
export declare type TUnknown = {
    kind: typeof UnknownKind;
} & CustomOptions;
export declare type TAny = {
    kind: typeof AnyKind;
} & CustomOptions;
export declare const ConstructorKind: unique symbol;
export declare const FunctionKind: unique symbol;
export declare const PromiseKind: unique symbol;
export declare const UndefinedKind: unique symbol;
export declare const VoidKind: unique symbol;
export declare type TConstructor<T extends TSchema[], U extends TSchema> = {
    kind: typeof ConstructorKind;
    type: 'constructor';
    arguments: readonly [...T];
    returns: U;
} & CustomOptions;
export declare type TFunction<T extends TSchema[], U extends TSchema> = {
    kind: typeof FunctionKind;
    type: 'function';
    arguments: readonly [...T];
    returns: U;
} & CustomOptions;
export declare type TPromise<T extends TSchema> = {
    kind: typeof PromiseKind;
    type: 'promise';
    item: T;
} & CustomOptions;
export declare type TUndefined = {
    kind: typeof UndefinedKind;
    type: 'undefined';
} & CustomOptions;
export declare type TVoid = {
    kind: typeof VoidKind;
    type: 'void';
} & CustomOptions;
export declare type TSchema = TIntersect<any> | TUnion<any> | TTuple<any> | TObject<TProperties> | TDict<any> | TArray<any> | TEnum<any> | TLiteral<any> | TString | TNumber | TInteger | TBoolean | TNull | TUnknown | TAny | TConstructor<any[], any> | TFunction<any[], any> | TPromise<any> | TUndefined | TVoid;
export declare type UnionToIntersect<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export declare type ReadonlyOptionalPropertyKeys<T> = {
    [K in keyof T]: T[K] extends TReadonlyOptional<infer U> ? K : never;
}[keyof T];
export declare type ReadonlyPropertyKeys<T> = {
    [K in keyof T]: T[K] extends TReadonly<infer U> ? K : never;
}[keyof T];
export declare type OptionalPropertyKeys<T> = {
    [K in keyof T]: T[K] extends TOptional<infer U> ? K : never;
}[keyof T];
export declare type PropertyKeys<T> = keyof Omit<T, ReadonlyOptionalPropertyKeys<T> | ReadonlyPropertyKeys<T> | OptionalPropertyKeys<T>>;
export declare type StaticProperties<T> = {
    readonly [K in ReadonlyOptionalPropertyKeys<T>]?: Static<T[K]>;
} & {
    readonly [K in ReadonlyPropertyKeys<T>]: Static<T[K]>;
} & {
    [K in OptionalPropertyKeys<T>]?: Static<T[K]>;
} & {
    [K in PropertyKeys<T>]: Static<T[K]>;
};
export declare type StaticIntersect<T extends readonly TSchema[]> = UnionToIntersect<StaticUnion<T>>;
export declare type StaticUnion<T extends readonly TSchema[]> = {
    [K in keyof T]: Static<T[K]>;
}[number];
export declare type StaticTuple<T extends readonly TSchema[]> = {
    [K in keyof T]: Static<T[K]>;
};
export declare type StaticObject<T extends TProperties> = StaticProperties<T>;
export declare type StaticDict<T extends TSchema> = {
    [key: string]: Static<T>;
};
export declare type StaticArray<T extends TSchema> = Array<Static<T>>;
export declare type StaticLiteral<T extends TValue> = T;
export declare type StaticEnum<T extends TKey> = T;
export declare type StaticConstructor<T extends readonly TSchema[], U extends TSchema> = new (...args: [...{
    [K in keyof T]: Static<T[K]>;
}]) => Static<U>;
export declare type StaticFunction<T extends readonly TSchema[], U extends TSchema> = (...args: [...{
    [K in keyof T]: Static<T[K]>;
}]) => Static<U>;
export declare type StaticPromise<T extends TSchema> = Promise<Static<T>>;
export declare type Static<T> = T extends TIntersect<infer U> ? StaticIntersect<U> : T extends TUnion<infer U> ? StaticUnion<U> : T extends TTuple<infer U> ? StaticTuple<U> : T extends TObject<infer U> ? StaticObject<U> : T extends TDict<infer U> ? StaticDict<U> : T extends TArray<infer U> ? StaticArray<U> : T extends TEnum<infer U> ? StaticEnum<U> : T extends TLiteral<infer U> ? StaticLiteral<U> : T extends TString ? string : T extends TNumber ? number : T extends TInteger ? number : T extends TBoolean ? boolean : T extends TNull ? null : T extends TUnknown ? unknown : T extends TAny ? any : T extends TConstructor<infer U, infer R> ? StaticConstructor<U, R> : T extends TFunction<infer U, infer R> ? StaticFunction<U, R> : T extends TPromise<infer U> ? StaticPromise<U> : T extends TUndefined ? undefined : T extends TVoid ? void : unknown;
export declare class TypeBuilder {
    /** Modifies a schema object property to be `readonly` and `optional`. */
    ReadonlyOptional<T extends TSchema>(item: T): TReadonlyOptional<T>;
    /** Modifies a schema object property to be `readonly`. */
    Readonly<T extends TSchema>(item: T): TReadonly<T>;
    /** Modifies a schema object property to be `optional`. */
    Optional<T extends TSchema>(item: T): TOptional<T>;
    /** Creates an Intersect schema. */
    Intersect<T extends TSchema[]>(items: [...T], options?: CustomOptions): TIntersect<T>;
    /** Creates a Union schema. */
    Union<T extends TSchema[]>(items: [...T], options?: CustomOptions): TUnion<T>;
    /** Creates a Tuple schema. */
    Tuple<T extends TSchema[]>(items: [...T], options?: CustomOptions): TTuple<T>;
    /** Creates a `object` schema with the given properties. */
    Object<T extends TProperties>(properties: T, options?: CustomOptions): TObject<T>;
    /** Creates a `{ [key: string]: T }` schema. */
    Dict<T extends TSchema>(item: T, options?: DictOptions): TDict<T>;
    /** Creates an `Array<T>` schema. */
    Array<T extends TSchema>(items: T, options?: ArrayOptions): TArray<T>;
    /** Creates an `Enum<T>` schema from a TypeScript `enum` definition. */
    Enum<T extends TEnumType>(item: T, options?: CustomOptions): TEnum<T[keyof T]>;
    /** Creates a literal schema. Supports `string | number | boolean` values. */
    Literal<T extends TValue>(value: T, options?: CustomOptions): TLiteral<T>;
    /** Creates a `string` schema. */
    String<TCustomFormatOption extends string>(options?: StringOptions<StringFormatOption | TCustomFormatOption>): TString;
    /** Creates a `string` schema from a regular expression. */
    RegEx(regex: RegExp, options?: CustomOptions): TString;
    /** Creates a `number` schema. */
    Number(options?: NumberOptions): TNumber;
    /** Creates a `integer` schema. */
    Integer(options?: NumberOptions): TInteger;
    /** Creates a `boolean` type. */
    Boolean(options?: CustomOptions): TBoolean;
    /** Creates a `null` type. */
    Null(options?: CustomOptions): TNull;
    /** Creates an `unknown` type. */
    Unknown(options?: CustomOptions): TUnknown;
    /** Creates an `any` type. */
    Any(options?: CustomOptions): TAny;
    /** `EXTENDED` Creates a `constructor` schema. */
    Constructor<T extends TSchema[], U extends TSchema>(args: [...T], returns: U, options?: CustomOptions): TConstructor<T, U>;
    /** `EXTENDED` Creates a `function` schema. */
    Function<T extends TSchema[], U extends TSchema>(args: [...T], returns: U, options?: CustomOptions): TFunction<T, U>;
    /** `EXTENDED` Creates a `Promise<T>` schema. */
    Promise<T extends TSchema>(item: T, options?: CustomOptions): TPromise<T>;
    /** `EXTENDED` Creates a `undefined` schema. */
    Undefined(options?: CustomOptions): TUndefined;
    /** `EXTENDED` Creates a `void` schema. */
    Void(options?: CustomOptions): TVoid;
}
export declare const Type: TypeBuilder;
