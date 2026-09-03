import { Meta } from "../../attribute/meta";
import { Attach } from "../../schema/struct/property/attach";
import { PrimaryIndex } from "../../property/core/indexes";
import { OfSchema } from "../../property/core/ofSchema";
import { SchemaType } from "../../property/core/schemaType";
import { SchemaKind } from "../../property/record/schemaKind";
import { Generics } from "../../schema/generic/generics";
import { Require } from "../../property/common/require";
import { Append } from "../../property/core/append";
import { Display } from "../../property/common/display";
import { Disable } from "../../property/common/disable";

import type { Entry, EntryAccess } from "./type";

import { NS_SYSTEM_BOOL, NS_SYSTEM_ENTRY, NS_SYSTEM_ENTRY_ACCESS, NS_SYSTEM_ENTRYS, SCHEMA_KIND_ENTRY, SCHEMA_KIND_ORDER_ENTRY, SCHEMA_KIND_STRUCT } from "../../utility/constant";

/** The runtime entry  */
@Meta(SchemaKind, [SCHEMA_KIND_ENTRY, SCHEMA_KIND_ORDER_ENTRY])
@Meta(Append, [Display, Disable])
@Meta(SchemaType, NS_SYSTEM_ENTRY)
@Meta(Attach, SCHEMA_KIND_ENTRY)
@Meta(Generics, [{ name: 'T' }])
class EntryMeta<T> implements Entry<T> {
  /** The value of the entry */
  @Meta(Require, true)
  @Meta(SchemaType, "T")
  @Meta(PrimaryIndex)
  value!: T;

  /** Has children entries */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  hasChildren: boolean = false;
}

/** The entry access, works for cascade selection */
@Meta(SchemaType, NS_SYSTEM_ENTRY_ACCESS)
@Meta(OfSchema, SCHEMA_KIND_STRUCT)
@Meta(Generics, [{ name: 'T' }])
class EntryAccessMeta<T> implements EntryAccess<T> {
  /** The entry in the path */
  @Meta(SchemaType, `${NS_SYSTEM_ENTRY}<T>`)
  entry?: Entry<T>;
  
  /** The children entries of the <see cref='entry'> */
  @Meta(SchemaType, `${NS_SYSTEM_ENTRYS}<T>`)
  children?: Entry<T>[];
}