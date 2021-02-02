"use strict";
/*--------------------------------------------------------------------------

TypeBox: JSON Schema Type Builder with Static Type Resolution for TypeScript

The MIT License (MIT)

Copyright (c) 2020 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.TypeBuilder = exports.VoidKind = exports.UndefinedKind = exports.PromiseKind = exports.FunctionKind = exports.ConstructorKind = exports.AnyKind = exports.UnknownKind = exports.NullKind = exports.BooleanKind = exports.IntegerKind = exports.NumberKind = exports.StringKind = exports.LiteralKind = exports.EnumKind = exports.ArrayKind = exports.DictKind = exports.ObjectKind = exports.TupleKind = exports.IntersectKind = exports.UnionKind = exports.ReadonlyModifier = exports.OptionalModifier = exports.ReadonlyOptionalModifier = void 0;
// ------------------------------------------------------------------------
// Modifiers
// ------------------------------------------------------------------------
exports.ReadonlyOptionalModifier = Symbol('ReadonlyOptionalModifier');
exports.OptionalModifier = Symbol('OptionalModifier');
exports.ReadonlyModifier = Symbol('ReadonlyModifier');
// ------------------------------------------------------------------------
// Schema: Core
// ------------------------------------------------------------------------
exports.UnionKind = Symbol('UnionKind');
exports.IntersectKind = Symbol('IntersectKind');
exports.TupleKind = Symbol('TupleKind');
exports.ObjectKind = Symbol('ObjectKind');
exports.DictKind = Symbol('DictKind');
exports.ArrayKind = Symbol('ArrayKind');
exports.EnumKind = Symbol('EnumKind');
exports.LiteralKind = Symbol('LiteralKind');
exports.StringKind = Symbol('StringKind');
exports.NumberKind = Symbol('NumberKind');
exports.IntegerKind = Symbol('IntegerKind');
exports.BooleanKind = Symbol('BooleanKind');
exports.NullKind = Symbol('NullKind');
exports.UnknownKind = Symbol('UnknownKind');
exports.AnyKind = Symbol('AnyKind');
// ------------------------------------------------------------------------
// Schema: Extended
// ------------------------------------------------------------------------
exports.ConstructorKind = Symbol('ConstructorKind');
exports.FunctionKind = Symbol('FunctionKind');
exports.PromiseKind = Symbol('PromiseKind');
exports.UndefinedKind = Symbol('UndefinedKind');
exports.VoidKind = Symbol('VoidKind');
// ------------------------------------------------------------------------
// Reflect
// ------------------------------------------------------------------------
function reflect(value) {
    switch (typeof value) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        default: return 'unknown';
    }
}
// ------------------------------------------------------------------------
// TypeBuilder
// ------------------------------------------------------------------------
class TypeBuilder {
    /** Modifies a schema object property to be `readonly` and `optional`. */
    ReadonlyOptional(item) {
        return { ...item, modifier: exports.ReadonlyOptionalModifier };
    }
    /** Modifies a schema object property to be `readonly`. */
    Readonly(item) {
        return { ...item, modifier: exports.ReadonlyModifier };
    }
    /** Modifies a schema object property to be `optional`. */
    Optional(item) {
        return { ...item, modifier: exports.OptionalModifier };
    }
    /** Creates an Intersect schema. */
    Intersect(items, options = {}) {
        return { ...options, kind: exports.IntersectKind, allOf: items };
    }
    /** Creates a Union schema. */
    Union(items, options = {}) {
        return { ...options, kind: exports.UnionKind, anyOf: items };
    }
    /** Creates a Tuple schema. */
    Tuple(items, options = {}) {
        const additionalItems = false;
        const minItems = items.length;
        const maxItems = items.length;
        return { ...options, kind: exports.TupleKind, type: 'array', items, additionalItems, minItems, maxItems };
    }
    /** Creates a `object` schema with the given properties. */
    Object(properties, options = {}) {
        const property_names = Object.keys(properties);
        const optional = property_names.filter(name => {
            const candidate = properties[name];
            return (candidate.modifier &&
                (candidate.modifier === exports.OptionalModifier ||
                    candidate.modifier === exports.ReadonlyOptionalModifier));
        });
        const required_names = property_names.filter(name => !optional.includes(name));
        const required = required_names.length ? required_names : undefined;
        return { ...options, kind: exports.ObjectKind, type: 'object', properties, required };
    }
    /** Creates a `{ [key: string]: T }` schema. */
    Dict(item, options = {}) {
        const additionalProperties = item;
        return { ...options, kind: exports.DictKind, type: 'object', additionalProperties };
    }
    /** Creates an `Array<T>` schema. */
    Array(items, options = {}) {
        return { ...options, kind: exports.ArrayKind, type: 'array', items };
    }
    /** Creates an `Enum<T>` schema from a TypeScript `enum` definition. */
    Enum(item, options = {}) {
        const values = Object.keys(item).filter(key => isNaN(key)).map(key => item[key]);
        return { ...options, kind: exports.EnumKind, enum: values };
    }
    /** Creates a literal schema. Supports `string | number | boolean` values. */
    Literal(value, options = {}) {
        const type = reflect(value);
        if (type === 'unknown') {
            throw Error(`Invalid literal value '${value}'`);
        }
        return { ...options, kind: exports.LiteralKind, type, enum: [value] };
    }
    /** Creates a `string` schema. */
    String(options = {}) {
        return { ...options, kind: exports.StringKind, type: 'string' };
    }
    /** Creates a `string` schema from a regular expression. */
    RegEx(regex, options = {}) {
        return this.String({ ...options, pattern: regex.source });
    }
    /** Creates a `number` schema. */
    Number(options = {}) {
        return { ...options, kind: exports.NumberKind, type: 'number' };
    }
    /** Creates a `integer` schema. */
    Integer(options = {}) {
        return { ...options, kind: exports.IntegerKind, type: 'integer' };
    }
    /** Creates a `boolean` type. */
    Boolean(options = {}) {
        return { ...options, kind: exports.BooleanKind, type: 'boolean' };
    }
    /** Creates a `null` type. */
    Null(options = {}) {
        return { ...options, kind: exports.NullKind, type: 'null' };
    }
    /** Creates an `unknown` type. */
    Unknown(options = {}) {
        return { ...options, kind: exports.UnknownKind };
    }
    /** Creates an `any` type. */
    Any(options = {}) {
        return { ...options, kind: exports.AnyKind };
    }
    /** `EXTENDED` Creates a `constructor` schema. */
    Constructor(args, returns, options = {}) {
        return { ...options, kind: exports.ConstructorKind, type: 'constructor', arguments: args, returns };
    }
    /** `EXTENDED` Creates a `function` schema. */
    Function(args, returns, options = {}) {
        return { ...options, kind: exports.FunctionKind, type: 'function', arguments: args, returns };
    }
    /** `EXTENDED` Creates a `Promise<T>` schema. */
    Promise(item, options = {}) {
        return { ...options, type: 'promise', kind: exports.PromiseKind, item };
    }
    /** `EXTENDED` Creates a `undefined` schema. */
    Undefined(options = {}) {
        return { ...options, type: 'undefined', kind: exports.UndefinedKind };
    }
    /** `EXTENDED` Creates a `void` schema. */
    Void(options = {}) {
        return { ...options, type: 'void', kind: exports.VoidKind };
    }
}
exports.TypeBuilder = TypeBuilder;
exports.Type = new TypeBuilder();
