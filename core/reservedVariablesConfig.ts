export type ReservedVariablesConfig = {
  characterClick?: boolean;
  errors?: boolean;
};

const defaultConfig = {
  characterClick: true,
  errors: true,
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
  }

  if (!config.errors) {
    reserved.add("vn_error");
  }
  return reserved;
}
