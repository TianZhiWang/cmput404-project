export default function reducer(state={
  fetching: false,
  fetched: false,
  funStuff: null,
  error: null,
}, action) {

  switch (action.type) {

  case "DO_FUN_SUTFF":{
    return {...state, 
      fetching: true,
      isFetched: false,
    };
        
  }
  case "DO_FUN_SUTFF_FULFILLED":{
    return {...state, 
      fetching: true,
      isFetched: false,
      funStuff: action.payload
    };
        
  }
  case "DO_FUN_SUTFF_REJECTED":{
    return {...state, 
      fetching: true,
      isFetched: false,
      error: action.payload
    };
        
  }
  }
  return state;
}