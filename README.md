# codemods: add PropsWithChildren to React.FC 

## motivation

Before React18 `React.FC` has and implicit definition for `children`. In React18 this definition was removed. As the result you can see a lot of TS errors after upgrade.
this codemods uses jscodeshift for:
1. add `PropsWithChildren` to your `React.FC` 
2. add import of `PropsWithChildren`

## examples

- `React.FC` -> `React.FC<PropsWithChildren>`
- `React.FC<Props>` -> `React.FC<PropsWithChildren<Props>>`
- `React.FC<{someProps: any}>` -> `React.FC<PropsWithChildren<{someProps: any}>>`

## usage

### install jscodeshift globally

```
$ npm install -g jscodeshift 
```

### run codemods
```
$ jscodeshift -t ./path-to-the-script/codemods-props-with-children.js --parser tsx --extensions tsx ./path-to-src
```
