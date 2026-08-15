import { registerTag, registerAlias, warnUnknownTag } from "../../registry";
import { parseOnOff } from "../../numericOrLabel";
import { setUiConfig as setUiConfigStore } from "../../uiConfig";
import * as messageManager from "../../../core/managers/messageManager";
import * as windowVisibilityManager from "../../../core/managers/windowVisibilityManager";
import * as choiceManager from "../../../core/managers/choiceManager";
import * as backlogManager from "../../../core/managers/backlogManager";
const defaultConfig = {
    transientDurationMs: 4000,
};
registerTag({
    key: "ui",
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const { atomKey, instanceId } = handlers;
        const [section, key, ...rest] = args;
        const value = rest.join(":");
        if (section === "messageWindow") {
            if (key === "mode") {
                if (value === "hide")
                    return messageManager.setMode(atomKey, "hide");
                if (value === "transient")
                    return messageManager.setMode(atomKey, "transient", config.transientDurationMs);
                return messageManager.setMode(atomKey, "persist");
            }
            if (key === "fade")
                return messageManager.setNextRevealFade(atomKey, value === "in");
            if (key === "show") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    windowVisibilityManager.setMessageWindowVisible(atomKey, on);
                return;
            }
            if (key === "interactive") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ messageWindow: { interactive: on } }, instanceId);
                return;
            }
            if (key === "skin")
                return setUiConfigStore({ messageWindow: { skin: value } }, instanceId);
            if (key === "offset") {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfigStore({ messageWindow: { offset: n } }, instanceId);
                return;
            }
            if (key === "autoHideOnCharHide") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ messageWindow: { autoHideOnCharHide: on } }, instanceId);
                return;
            }
            if (key === "autoHideOnBgChange") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ messageWindow: { autoHideOnBgChange: on } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        if (section === "choice") {
            if (key === "show") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    choiceManager.setChoicesVisible(atomKey, on);
                return;
            }
            if (key === "autoClearOnChoose") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ choice: { autoClearOnChoose: on } }, instanceId);
                return;
            }
            if (key === "interactive") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ choice: { interactive: on } }, instanceId);
                return;
            }
            if (key === "spacing") {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfigStore({ choice: { spacing: n } }, instanceId);
                return;
            }
            if (key === "skin")
                return setUiConfigStore({ choice: { skin: value } }, instanceId);
            if (key === "anchor")
                return setUiConfigStore({ choice: { anchor: value === "reset" ? undefined : value } }, instanceId);
            if (key === "offset") {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfigStore({ choice: { offset: n } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        if (section === "backlog") {
            if (key === "clear")
                return backlogManager.clear(atomKey, instanceId);
            if (key === "show") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ backlog: { show: on } }, instanceId);
                return;
            }
            if (key === "skin")
                return setUiConfigStore({ backlog: { skin: value } }, instanceId);
            if (key === "mode" && (value === "global" || value === "perInstance")) {
                return setUiConfigStore({ backlog: { mode: value } }, instanceId);
            }
            if (key === "anchor")
                return setUiConfigStore({ backlog: { anchor: value === "reset" ? undefined : value } }, instanceId);
            if (key === "offset") {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfigStore({ backlog: { offset: n } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        if (section === "character") {
            if (key === "clickable") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ character: { clickable: on } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        if (section === "font") {
            if (key === "family")
                return setUiConfigStore({ font: { family: value } }, instanceId);
            if (key === "size") {
                const n = Number(value);
                if (Number.isFinite(n))
                    return setUiConfigStore({ font: { sizePx: n } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        if (section === "stage") {
            if (key === "stickToViewport") {
                const on = parseOnOff(value);
                if (on !== undefined)
                    setUiConfigStore({ stage: { stickToViewport: on } }, instanceId);
                return;
            }
            if (key === "height") {
                const n = Number(value);
                if (Number.isFinite(n) && n > 0)
                    return setUiConfigStore({ stage: { heightPx: n } }, instanceId);
                return;
            }
            if (key === "width") {
                const n = Number(value);
                if (Number.isFinite(n) && n > 0)
                    return setUiConfigStore({ stage: { widthPx: n } }, instanceId);
                return;
            }
            return warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
        }
        warnUnknownTag(["ui", section, key, value].filter(Boolean).join(":"));
    },
});
registerAlias("u", "ui");
//# sourceMappingURL=ui.js.map