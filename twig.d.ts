interface Template {
    (parameters: object): string
}

declare module '*.twig' {
    const template: Template;
    export default template;
}
