import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ShinyRotatingBorderButton } from '@/components/ui/shiny-rotating-border-button';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <ShinyRotatingBorderButton className="p-2!">
        <div className="flex items-center gap-2">
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
    {
      type: 'button',
      text: 'Discussion',
      url: 'https://github.com/BioinformaticsOnLine/CHITRA/discussions/',
    },
  ],
};