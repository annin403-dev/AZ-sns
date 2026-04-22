import { Metadata } from 'next';
import QuizApp from './QuizApp';

export const metadata: Metadata = {
  title: 'AZタイプ診断 | AZ',
  description: 'あなたの思考・行動・価値観を診断し、人生の進め方を見つけよう。',
};

export default function QuizPage() {
  return <QuizApp />;
}
