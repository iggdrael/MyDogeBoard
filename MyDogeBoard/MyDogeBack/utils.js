function valeur_initiale(value, pourcent){
//Valeur Initiale =  Valeur Finale / Coefficient Multiplicateur 
    return (value / (1 + (pourcent / 100)));
}
function taux_variation(Vfin, Vdep){
//TV = (Vfin - Vdep) / Vdep * 100
    return (Vfin - Vdep) / Vdep * 100
}

module.exports = { valeur_initiale, taux_variation }