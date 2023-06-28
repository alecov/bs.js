/**
 * Iteratively calculates a map of variables from a map of formulas.
 * Stops the iteration if all remaining formulas fail. A formula fails if it
 * returns a non-zero falsy value.
 *
 * This function is used to calculate several interdependent values from either
 * starting variables, given any formulas that calculate one from another. This
 * avoids long if-else logic chains to calculate for every possible input
 * combination.
 *
 * @param state The initial variable map state. Non-zero falsy values are
 *   ignored.
 * @param formulas The map of formulas. Each entry maps a variable name to a
 *   list of callables which receive the variable map state as one argument, and
 *   returns the calculated variable value.
 * @param deps The variable dependency groups set: a list of lists. Each entry
 *   is a list containing variable names which cannot be defined together in the
 *   initial variable map state.
 * @param flags Extra flags for the calculation.
 * @returns The final calculation state.
 * @throws `Error` if the initial state fails the dependency check; or any other
 *   exception raised by formulas.
 */
export default function (state, formulas, deps, flags) {
  // Prune input state from non-zero falsy values.
  state = Object.fromEntries(
    Object.entries(state).filter(([, value]) => value || value === 0)
  );

  // Check for dependencies in the input state.
  const params = new Set(Object.keys(state));
  for (const dep of deps) {
    if (flags?.debug) console.debug(`Checking dependency set [${dep}]`);
    if (params.has(dep)) throw new Error("Invalid parameter set");
  }

  // Calculate formulas iteratively.
  let added;
  formulas = { ...formulas };
  do {
    added = false;
    for (const key in formulas) {
      const value = state[key];
      if (value || value === 0) {
        if (flags?.debug) console.debug(`Skipping [${key}] in state`);
        delete formulas[key];
        continue;
      }
      for (const func in formulas[key]) {
        let value = formulas[key][func]({ ...state });
        if (!value && value !== 0) continue;
        if (flags?.debug)
          console.debug(
            `Calculated [${key} = ${value}] from formula [${func}: ${formulas[key][func]}]`
          );
        state[key] = value;
        added = true;
        delete formulas[key];
        break;
      }
    }
  } while (added);

  // Return the final state.
  return state;
}
