import { registerTag, registerAlias, warnUnknownTag } from "../../registry";
import { isNumeric } from "../../numericOrLabel";
import * as characterManager from "../../../core/managers/characterManager";
const defaultConfig = {
    speeds: {
        slow: 0.5,
        normal: 1,
        fast: 2,
    },
};
registerTag({
    key: "anim",
    defaultConfig,
    run: ({ args, handlers, config }) => {
        const [name, mode, value] = args;
        if (!name || !mode)
            return;
        const { atomKey } = handlers;
        switch (mode) {
            case "motion":
                characterManager.setAnimMotion(atomKey, name, value);
                break;
            case "loop":
                characterManager.setAnimLoop(atomKey, name, value);
                break;
            case "stop":
                characterManager.setAnimStop(atomKey, name);
                break;
            case "speed": {
                const speed = isNumeric(value) ? Number(value) : config.speeds[value];
                if (speed !== undefined)
                    characterManager.setAnimSpeed(atomKey, name, speed);
                break;
            }
            case "reverse":
                characterManager.setAnimReverse(atomKey, name, value);
                break;
            default:
                warnUnknownTag(["anim", name, mode, value].filter(Boolean).join(":"));
        }
    },
});
registerAlias("a", "anim");
//# sourceMappingURL=anim.js.map