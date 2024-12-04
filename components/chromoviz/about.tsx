import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Globe, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    scholar?: string;
    researchgate?: string;
  };
}

const team: TeamMember[] = [
  {
    name: "Pranjal Pruthi",
    role: "Core Web Developer & Research Scientist",
    bio: "Research Scientist at CSIR-IGIB: Exploring the frontiers of genomics | Skilled in IT, Full Stack Web development, Database Administration and Bioinformatics, Building innovative and user-friendly platforms",
    avatar: "/avatars/pranjal.jpg", // Add your avatar image
    links: {
      github: "https://github.com/pranjalpruthi",
      linkedin: "https://www.linkedin.com/in/pranjal-pruthi/",
      twitter: "https://x.com/pranjalpruthi",
      website: "https://pranjal.mmm.page"
    }
  },
  {
    name: "Dr. Jitendra Narayan",
    role: "Principal Investigator",
    bio: "Specializing in Comparative Genomics, Genome Evolution, Adaptation, Chromosome Rearrangements, HGT, Repeats",
    avatar: "/avatars/jitendra.jpg", // Add PI's avatar image
    links: {
      website: "https://bioinformaticsonline.com/profile/admin",
      scholar: "https://scholar.google.co.uk/citations?user=ySm4BzcAAAAJ&hl=en",
      researchgate: "https://www.researchgate.net/profile/Jitendra-Narayan-3",
      twitter: "https://x.com/jnarayan81"
    }
  }
];

export function AboutSheet({ children }: { children?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || <Button variant="ghost" className="hover:bg-accent/50 h-9">About</Button>}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-2xl">About CHITRA</SheetTitle>
          <SheetDescription>
            CHITRA (CHromosome Interactive Tool for Rearrangement Analysis) is a powerful tool designed for visualizing and analyzing chromosomal data.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Project Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
            <p className="text-muted-foreground">
              A comprehensive suite of features for exploring chromosomal rearrangements and synteny blocks, making it an invaluable resource for researchers and scientists.
            </p>
          </div>

          <Separator />

          {/* Team Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Team</h3>
            <div className="space-y-6">
              {team.map((member) => (
                <div key={member.name} className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                    <div className="flex space-x-2">
                      {member.links.github && (
                        <Link href={member.links.github} target="_blank" className="text-muted-foreground hover:text-primary">
                          <Github className="h-4 w-4" />
                        </Link>
                      )}
                      {member.links.twitter && (
                        <Link href={member.links.twitter} target="_blank" className="text-muted-foreground hover:text-primary">
                          <Twitter className="h-4 w-4" />
                        </Link>
                      )}
                      {member.links.linkedin && (
                        <Link href={member.links.linkedin} target="_blank" className="text-muted-foreground hover:text-primary">
                          <Linkedin className="h-4 w-4" />
                        </Link>
                      )}
                      {member.links.website && (
                        <Link href={member.links.website} target="_blank" className="text-muted-foreground hover:text-primary">
                          <Globe className="h-4 w-4" />
                        </Link>
                      )}
                      {member.links.scholar && (
                        <Link href={member.links.scholar} target="_blank" className="text-muted-foreground hover:text-primary">
                          <GraduationCap className="h-4 w-4" />
                        </Link>
                      )}
                      {member.links.researchgate && (
                        <Link href={member.links.researchgate} target="_blank" className="text-muted-foreground hover:text-primary">
                          <BookOpen className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Funding & Institution */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Funding & Institution</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This project is funded by the Rockefeller Foundation.
              </p>
              <p className="text-sm text-muted-foreground">
                Hosted at CSIR Institute of Genomics and Integrative Biology (CSIR-IGIB), Delhi, India.
              </p>
            </div>
          </div>

          <Separator />

          {/* Citation */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Citation</h3>
            <code className="block text-sm bg-muted p-4 rounded-md">
              Pruthi, P., & Narayan, J. (2024). CHITRA: CHromosome Interactive Tool for Rearrangement Analysis. CSIR-IGIB.
            </code>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}