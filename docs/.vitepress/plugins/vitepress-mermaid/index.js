export function mermaidPlugin(md) {
    const defaultFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];

        if (token.info.trim() === 'mermaid') {
            const code = token.content;

            return `<MermaidDiagram code="${md.utils
                .escapeHtml(code)
                .replace(/"/g, '&quot;')}" />\n`;
        }

        return defaultFence(tokens, idx, options, env, self);
    };
}
