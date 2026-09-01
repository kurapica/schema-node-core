import { Meta } from '../attribute/meta';
import { OfSchema } from '../property/core/ofSchema';
import { SchemaType } from '../property/core/schemaType';
import { Base } from '../property/core/base';
import { UpLimitString } from '../schema/string/property/upLimit';
import { LowLimitString } from '../schema/string/property/lowLimit';
import { JsRegex } from '../property/common/jsRegex';

import { SCHEMA_KIND_STRING, NS_SYSTEM_STRING, NS_SYSTEM_CHAR, NS_SYSTEM_GUID, NS_SYSTEM_LANGUAGE, LANGUAGE_MAX_LEN, NS_SYSTEM_IDENTIFIER, PRIMARY_KEY_MAX_LEN } from '../utility/constant';

/** Represents the string type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_STRING)
class StringMeta {}

/** Represents the character type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_CHAR)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, 1)
@Meta(LowLimitString, 1)
class CharMeta {}

/** Represents the GUID type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_GUID)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, 36)
@Meta(LowLimitString, 36)
@Meta(JsRegex, "^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$")
class GuidMeta {}
        
/** Represents the language type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_LANGUAGE)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, LANGUAGE_MAX_LEN)
@Meta(JsRegex, "^[a-z]{2}-?[A-Z]{2}$")
class LanguageMeta {}

/** Represents the identifier type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
@Meta(JsRegex, "^[a-zA-Z]\\w*$")
class IdentifierMeta {}
