let CharacterMixin = {
    setStateTable(stateTable) {
       this.stateTable = stateTable;
    },
    setDecisionMaker(decisionMaker)
    {
        this.decisionMaker = decisionMaker;
    },
    update()
    {
       const state =  this.stateTable.getNextState();
       decisionMaker.perform(state);
       this.updateAnimation();
    }
};

export {CharacterMixin};