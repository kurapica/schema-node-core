import { Meta } from "../attribute";
import { LowLimitString, OfSchema, SchemaType, UpLimitString } from "../property";
import { Base } from "../property/core";
import { SCHEMA_KIND_STRING, NS_SYSTEM_STRING, NS_SYSTEM_CHAR, NS_SYSTEM_STR, NS_SYSTEM_GUID, NS_SYSTEM_LANGUAGE, LANGUAGE_MAX_LEN, NS_SYSTEM_IDENTIFIER, PRIMARY_KEY_MAX_LEN } from "../utility";

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
class GuidMeta {}
        
/** Represents the language type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_LANGUAGE)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, LANGUAGE_MAX_LEN)
class LanguageMeta {}

/** Represents the identifier type */
@Meta(OfSchema, SCHEMA_KIND_STRING)
@Meta(SchemaType, NS_SYSTEM_IDENTIFIER)
@Meta(Base, NS_SYSTEM_STRING)
@Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
class IdentifierMeta {}
