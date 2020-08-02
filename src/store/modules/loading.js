const loading = {
  state : {
    loading : false
  },

  mutations : {
    showLoading(state,load) {
      state.loading =load
    }
  },

  actions : {
    setLoading(context,load) {
      context.commit("showLoading",load);
    }
  },

  getters :{
    isLoading:(state)=>{
      return state.loading
    }
  }
}
export default loading