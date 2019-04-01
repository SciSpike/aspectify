# `aspectify`
This package contains an implementation of exclusively _decorator-driven_ aspect-oriented programming (AOP).
It's similar in spirit to AspectJ's annotation-driven approach, whereby advised methods carry a visual indicator in the source (the decorator itself) that there is incoming behavior.
In this way, there is no need for a special, AOP-aware editor for the developer to know when there is incoming advice.

> NOTE: This currently uses Babel 7's `@babel/plugin-proposal-decorators` in `legacy: true` mode, which is compliant with TC39's Stage 1 decorator proposal.
It also uses `@babel/plugin-proposal-class-properties` with setting `loose: true`.
As the decorator proposal matures, this library will have to be updated to support later proposals (stage 2 & later).

As the project takes shape, we'll be adding more to this readme.
In the meantime, see the tests for usage information.
