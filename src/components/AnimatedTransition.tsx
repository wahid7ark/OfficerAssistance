import { useEffect, useState } from 'react';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  className?: string;
}

export function AnimatedTransition({
  children,
  isVisible,
  direction = 'up',
  duration = 300,
  className = ''
}: AnimatedTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  if (!shouldRender) return null;

  const directionClasses = {
    up: isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
    down: isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
    left: isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
    right: isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
  };

  return (
    <div
      className={`transition-all ease-out ${directionClasses[direction]} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 500, className = '' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ children, staggerDelay = 100, className = '' }: StaggerContainerProps) {
  return (
    <div className={className}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <FadeIn key={index} delay={index * staggerDelay}>
            {child}
          </FadeIn>
        ))
      ) : (
        <FadeIn>{children}</FadeIn>
      )}
    </div>
  );
}
