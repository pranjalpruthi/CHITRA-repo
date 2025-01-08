import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { DnaIcon, Sparkles } from 'lucide-react';
import { ShinyRotatingBorderButton } from '@/components/ui/shiny-rotating-border-button';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <ShinyRotatingBorderButton className="!p-2">
        <div className="flex items-center gap-2">
          <DnaIcon className="h-6 w-6" />
          <span>CHITRA</span>
        </div>
      </ShinyRotatingBorderButton>
    ),
    url: '/',
  },
  githubUrl: 'https://github.com/pranjalpruthi/CHITRA',
  links: [
    {
      type: 'button',
      text: 'Feedback',
      url: 'https://github.com/pranjalpruthi/CHITRA/issues/new',
    },
  ],
};