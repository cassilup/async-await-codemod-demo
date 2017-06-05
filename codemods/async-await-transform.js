// Works with https://github.com/facebook/jscodeshift
// Based on work done by cpojer https://github.com/cpojer/js-codemod/pull/49/commits/19ed546d8a47127d3d115f933d924106c98e1b8b
// Converts ../index.js to use async/await.

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const isPromiseCall = node => {
    return node.type === 'CallExpression' &&
      node.callee.property &&
      node.callee.property.name === 'then';
  };

  const funcReturnsPromise = p => {
    if (isPromiseCall(p.node)) {
      console.log(p.node.type, p.node.loc, p.node.object,
      p.node.callee.property);
    }
    return isPromiseCall(p.node);
  };

  const arrowReturnsPromise = p => {
    const node = p.node;

    if (node.body.type === 'BlockStatement') {
      const body = node.body.body;
      const last = body[body.length - 1];
      if (last.type !== 'ReturnStatement') { return false; }
      return isPromiseCall(last.argument);
    }

    return isPromiseCall(node.body);
  };

  const funcContainsPromiseExpressionStatement = p => {
    const fnStatementsArray = p.node.body.body;

    for (let i = 0; i <= fnStatementsArray.length; i++) {
      const statement = fnStatementsArray[i];

      if (
        statement &&
        statement.expression &&
        statement.expression.type === 'CallExpression' &&
        statement.expression.callee.property.name === 'then'
      ) {
        // mark function as containing a Promise Expression
        return true;
      }
    }
  };

  const genAwaitionDeclarator = (params, exp) => {
    let declaratorId;
    if (params.length > 1) {
      declaratorId = j.arrayPattern(params);
    } else {
      declaratorId = params[0];
    }

    return j.variableDeclaration('const', [
      j.variableDeclarator(declaratorId, j.awaitExpression(exp)),
    ]);
  };

  const transformFunction = p => {
    const node = p.node;

    // Set function to async
    node.async = true;

    // Transform return
    const bodyStatements = node.body.body;
    const returnExp = bodyStatements[bodyStatements.length - 1];

    const callExp = returnExp.expression;
    const callBack = callExp.arguments[0];

    let errorCallBack;
    if (callExp.arguments[1]) {
      errorCallBack = callExp.arguments[1];
    }

    // Create await statement
    let awaition;
    if (callBack.params.length > 0) {
      awaition = genAwaitionDeclarator(callBack.params, callExp.callee.object);
    } else {
      awaition = j.expressionStatement(j.awaitExpression(callExp.callee.object));
    }

    let rest;
    if (callBack.body.type === 'BlockStatement') {
      rest = callBack.body.body;
    } else {
      rest = [j.returnStatement(callBack.body)];
    }

    // Replace the function's body with the new content
    p.node.body = j.blockStatement([
      j.tryStatement(
        j.blockStatement([
          ...bodyStatements.slice(0, bodyStatements.length - 1),
          awaition,
          ...rest,
        ]),
        j.catchClause(
          errorCallBack.params[0],
          null,
          j.blockStatement(errorCallBack.body.body)
        )
      ),
    ]);

    return p.node;
  };

  const replaceType = (type, filterer = funcReturnsPromise) => {
    // Loop until all promises are gone
    while (true) {
      const paths = root.find(type).filter(filterer);
      if (paths.size() === 0) { break; }

      paths.forEach(transformFunction);
    }
  };

  replaceType(j.FunctionDeclaration);
  replaceType(j.ArrowFunctionExpression, arrowReturnsPromise);

  // TODO: Write unit tests for this
  replaceType(j.FunctionExpression, funcContainsPromiseExpressionStatement);

  // TODO: cover more async/await cases
  return root.toSource();
}
