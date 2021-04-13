

/**
 * Return the initial value from the final value and the percentage of fluctuation
 *
 * @param {*} value
 * @param {*} pourcent
 * @return {*} 
 */
function valeur_initiale(value, pourcent){
//Valeur Initiale =  Valeur Finale / Coefficient Multiplicateur 
    return (value / (1 + (pourcent / 100)));
}

/**
 * Return the variation rate in percentage between two values
 * 
 * @param {*} Vfin
 * @param {*} Vdep
 * @return {*} 
 */
function taux_variation(Vfin, Vdep){
//TV = (Vfin - Vdep) / Vdep * 100
    return (Vfin - Vdep) / Vdep * 100
}


/**
 * Check if the given object is empty
 *
 * @param {*} obj
 * @return {*} true if obj is empty
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = { valeur_initiale, taux_variation, isEmpty }