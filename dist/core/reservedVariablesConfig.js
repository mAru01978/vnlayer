const defaultConfig = {
    characterClick: true,
    errors: true,
};
let current = { ...defaultConfig };
export function setReservedVariablesConfig(patch) {
    current = {
        ...current,
        ...patch,
    };
}
export function getReservedVariablesConfig() {
    return current;
}
export function getReservedVariableNames() {
    const config = getReservedVariablesConfig();
    const reserved = new Set();
    if (!config.characterClick) {
        reserved.add("vn_event_char_click");
    }
    if (!config.errors) {
        reserved.add("vn_error");
    }
    return reserved;
}
//# sourceMappingURL=reservedVariablesConfig.js.map