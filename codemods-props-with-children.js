const PROPS_WITH_CHILDREN = 'PropsWithChildren'
export default function transformer(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);
  const reactFCTypes = root.find(j.TSTypeReference, {
    typeName: {
      left: {
        name: 'React',
      },
      right: {
        name: 'FC',
      },
    },
  });

  const isReactFCExist = reactFCTypes.size();
  if (isReactFCExist > 0) {
    // add PropsWithChildren to import
    const reactImports = root.find(j.ImportDeclaration, { source: { value: 'react' } });

    const isReactImportExist = reactImports.size() > 0;
    if (isReactImportExist) {
      reactImports.find(j.ImportNamespaceSpecifier).replaceWith(nodePath => {
        return j.importDefaultSpecifier(j.identifier('React'));
      });

      reactImports.get('specifiers').push(j.importSpecifier(j.identifier(PROPS_WITH_CHILDREN)));
    } else {
      root
        .find(j.Program)
        .get('body')
        .unshift(
          j.importDeclaration(
            [
              j.importDefaultSpecifier(j.identifier('React')),
              j.importSpecifier(j.identifier(PROPS_WITH_CHILDREN)),
            ],
            j.literal('react'),
          ),
        );
    }

    // wrap with PropsWithChildren
    reactFCTypes.forEach(nodePath => {
      const isGenericWithParam = nodePath.value.typeParameters !== null;
      if (isGenericWithParam) {
        /**
         * handle: const Cmt: React.FC<Prop> = ...
         * */

        const typeParamaters = nodePath.value.typeParameters
        const nextTypeParams = [typeParamaters.params[0]];
        typeParamaters.params = [
          j.tsTypeReference(
            j.identifier(PROPS_WITH_CHILDREN),
            j.tsTypeParameterInstantiation(nextTypeParams),
          ),
        ];
      } else {
        /**
         * handle: const Cmt: React.FC = ...
         * */
        nodePath.value.typeParameters = j.tsTypeParameterInstantiation([
          j.tsTypeReference(j.identifier(PROPS_WITH_CHILDREN)),
        ]);
      }
    });
  }

  return root.toSource();
}
