import { createStore } from 'vuex';
const store = createStore({
  state(){
    return {
      applicationData: null,
      applicationReceiverCount:0,
    };
  },
  mutations: {
    setApplicationData(state, id) {
      state.applicationData = id;
    },
    updateApplicationReceiverCount(state, count) {
      state.applicationReceiverCount = count;
    },
  },
});

export default store;