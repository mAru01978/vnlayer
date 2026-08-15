export function atomFamily(initializeAtom, areEqual) {
    let shouldRemove = null;
    const atoms = new Map();
    const listeners = new Set();
    function createAtom(param) {
        let item;
        if (areEqual === undefined) {
            item = atoms.get(param);
        }
        else {
            // Custom comparator, iterate over all elements
            for (const [key, value] of atoms) {
                if (areEqual(key, param)) {
                    item = value;
                    break;
                }
            }
        }
        if (item !== undefined) {
            if (shouldRemove?.(item[1], param)) {
                createAtom.remove(param);
            }
            else {
                return item[0];
            }
        }
        const newAtom = initializeAtom(param);
        atoms.set(param, [newAtom, Date.now()]);
        notifyListeners('CREATE', param, newAtom);
        return newAtom;
    }
    function notifyListeners(type, param, atom) {
        for (const listener of listeners) {
            listener({ type, param, atom });
        }
    }
    createAtom.unstable_listen = (callback) => {
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
        };
    };
    createAtom.getParams = () => atoms.keys();
    createAtom.remove = (param) => {
        if (areEqual === undefined) {
            if (!atoms.has(param))
                return;
            const [atom] = atoms.get(param);
            atoms.delete(param);
            notifyListeners('REMOVE', param, atom);
        }
        else {
            for (const [key, [atom]] of atoms) {
                if (areEqual(key, param)) {
                    atoms.delete(key);
                    notifyListeners('REMOVE', key, atom);
                    break;
                }
            }
        }
    };
    createAtom.setShouldRemove = (fn) => {
        shouldRemove = fn;
        if (!shouldRemove)
            return;
        for (const [key, [atom, createdAt]] of atoms) {
            if (shouldRemove(createdAt, key)) {
                atoms.delete(key);
                notifyListeners('REMOVE', key, atom);
            }
        }
    };
    return createAtom;
}
//# sourceMappingURL=atomFamily.js.map