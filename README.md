# schema-node-core (not done yet)

`schema-node-core` is the language-independent semantic core of the SchemaNode ecosystem, implemented in TypeScript.

It provides the same metadata model and schema runtime foundation as `SchemaNode.Core` on .NET, enabling schema definitions, metadata processing, property inheritance, and semantic data nodes to run consistently in browser and Node.js environments.

This package intentionally contains **no application protocols, storage providers, or network communication**. Its responsibility is to describe and manipulate semantic models only.

## Features

* Decorator-based metadata system (`@Meta`)
* Property inheritance and prototype-chain resolution
* Schema and Property definitions
* Semantic `DataNode` model
* Dynamic property resolution
* Relation and inherited property evaluation
* Language-independent semantic runtime foundation

## Design Goals

`schema-node-core` is designed around semantic descriptions rather than implementation details.

A schema describes **what something is**, not **how it is executed**.

This allows the same semantic model to be shared by:

* TypeScript applications
* .NET runtime
* AI agents
* Workflow engines
* MCP integrations
* Future language implementations

The runtime remains deterministic because all executable behavior is represented by semantic properties instead of language-specific code.

## Relationship to schema-node

The project is split into two layers:

* **schema-node-core**

  * Semantic model
  * Metadata system
  * Property system
  * DataNode
  * Schema definitions

* **schema-node**

  * Application management
  * Client APIs
  * Runtime communication
  * App protocol
  * Higher-level SDKs

This separation mirrors the architecture of the .NET implementation, allowing both frontend and backend to share the same semantic foundation while evolving independently.

## Philosophy

SchemaNode is designed to reduce uncertainty in software systems.

Rather than relying on language-specific reflection, scripts, or AI-generated code, the core represents software as explicit semantic structures that are readable, composable, and verifiable by both humans and machines.

The goal is not to replace developers with AI, but to provide a stable semantic foundation where developers, AI agents, workflows, and runtime services can collaborate through the same deterministic model.
