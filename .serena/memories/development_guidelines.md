# Development Guidelines - Kho Vải Tồn

## Code Standards
- Use TypeScript for all new code
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Implement proper error handling
- Write tests for new features

## Component Structure
```typescript
// Standard component structure
interface ComponentProps {
  // Define props with TypeScript
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Implementation
  };
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
};
```

## Service Layer Pattern
- All external API calls go through services
- Use proper error handling and loading states
- Implement retry logic where appropriate
- Cache responses when beneficial

## State Management
- Use Zustand for global state
- Keep component state local when possible
- Use React Query for server state
- Implement proper loading and error states

## Testing Strategy
- Unit tests for utilities and services
- Component tests for UI logic
- Integration tests for critical flows
- E2E tests for main user journeys

## Performance Guidelines
- Lazy load components when appropriate
- Optimize images (use Cloudinary transformations)
- Implement proper memoization
- Monitor bundle size

## Deployment Process
1. Test locally with `npm run dev`
2. Run tests with `npm test`
3. Check linting with `npm run lint`
4. Build production with `npm run build`
5. Deploy to Vercel with `npm run deploy`

## Common Patterns
- Use custom hooks for reusable logic
- Implement proper loading states
- Handle errors gracefully
- Use TypeScript interfaces for data shapes
- Follow consistent naming conventions

## Security Considerations
- Validate all user inputs
- Sanitize data before display
- Use environment variables for secrets
- Implement proper CORS settings
- Validate API responses
