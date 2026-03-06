import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DiagnosisResult } from '../logic/scoring';

interface UserState {
  answers: number[];
  result: DiagnosisResult | null;
  isCompleted: boolean;
}

interface UserContextType {
  state: UserState;
  setAnswer: (index: number, value: number) => void;
  setResult: (result: DiagnosisResult) => void;
  reset: () => void;
}

type Action =
  | { type: 'SET_ANSWER'; index: number; value: number }
  | { type: 'SET_RESULT'; result: DiagnosisResult }
  | { type: 'RESET' };

const initialState: UserState = {
  answers: Array(16).fill(3),
  result: null,
  isCompleted: false,
};

function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const answers = [...state.answers];
      answers[action.index] = action.value;
      return { ...state, answers };
    }
    case 'SET_RESULT':
      return { ...state, result: action.result, isCompleted: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setAnswer = (index: number, value: number) => {
    dispatch({ type: 'SET_ANSWER', index, value });
  };

  const setResult = (result: DiagnosisResult) => {
    dispatch({ type: 'SET_RESULT', result });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <UserContext.Provider value={{ state, setAnswer, setResult, reset }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
