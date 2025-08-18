import React from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type FormStep = 'customer-address' | 'items' | 'quote' | 'notes';

interface QuoteStepIndicatorProps {
  steps: FormStep[];
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  isStepCompleted: (step: FormStep) => boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  loading: boolean;
}

export const QuoteStepIndicator: React.FC<QuoteStepIndicatorProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  isStepCompleted,
  onPrevStep,
  onNextStep,
  onSubmit,
  isEditing,
  loading
}) => {
  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return 'Customer & Address';
      case 'items': return 'Items';
      case 'quote': return 'Quote Details';
      case 'notes': return 'Notes';
      default: return 'Quote';
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
      <Button
        type="button"
        onClick={onPrevStep}
        variant="secondary"
        size="sm"
        icon={ChevronLeft}
        iconOnly
        disabled={currentStep === 'customer-address'}
        className="w-8 h-8"
      />
      
      <div className="flex items-center space-x-1 flex-1 justify-center">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = isStepCompleted(step);
          
          return (
            <React.Fragment key={step}>
              <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-purple-500 text-white' 
                  : isCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => setCurrentStep(step)}
              >
                {getStepTitle(step)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-6 h-0.5 ${
                  isStepCompleted(steps[index]) ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {currentStep === 'notes' ? (
        <Button
          type="submit"
          loading={loading}
          size="sm"
          icon={CheckCircle}
          iconOnly
          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          title={isEditing ? "Update Quote" : "Create Quote"}
          onClick={onSubmit}
        />
      ) : (
        <Button
          type="button"
          onClick={onNextStep}
          variant="primary"
          size="sm"
          icon={ChevronRight}
          iconOnly
          className="w-8 h-8"
        />
      )}
    </div>
  );
};