const defaultConfig = {
    characterClick: true,
    errors: true,
    visitCounts: false,
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
        reserved.add("vn_event_char_click_seq");
    }
    if (!config.errors) {
        reserved.add("vn_error");
        reserved.add("vn_error_seq");
    }
    return reserved;
}
//# sourceMappingURL=reservedVariablesConfig.js.map