export type ReservedVariablesConfig = {
  characterClick?: boolean;
  errors?: boolean;
  visitCounts?: boolean;
};

const defaultConfig = {
  characterClick: true,
  errors: true,
  visitCounts: false,
};

let current = { ...defaultConfig };

export function setReservedVariablesConfig(
  patch: ReservedVariablesConfig,
): void {
  current = {
    ...current,
    ...patch,
  };
}

export function getReservedVariablesConfig() {
  return current;
}

export function getReservedVariableNames(): Set<string> {
  const config = getReservedVariablesConfig();
  const reserved = new Set<string>();

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
