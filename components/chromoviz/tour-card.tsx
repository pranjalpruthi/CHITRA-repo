// components/chromoviz/tour-card.tsx
"use client";

import React from "react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export const TourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  const { closeOnborda } = useOnborda();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-[320px] shadow-lg">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => closeOnborda()}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{step.icon}</span>
            <div className="space-y-1">
              <h4 className="font-medium leading-none">{step.title}</h4>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm">{step.content}</CardContent>
        <CardFooter className="flex justify-between">
          {currentStep !== 0 ? (
            <Button variant="outline" size="sm" onClick={() => prevStep()}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {currentStep + 1 !== totalSteps ? (
            <Button size="sm" onClick={() => nextStep()}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={() => closeOnborda()}>
              Finish
            </Button>
          )}
        </CardFooter>
        <span className="text-primary">{arrow}</span>
      </Card>
    </motion.div>
  );
};