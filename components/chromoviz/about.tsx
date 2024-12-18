import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Linkedin, Globe, BookOpen, GraduationCap, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  image: string;
  links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    scholar?: string;
    researchgate?: string;
    email?: string;
  };
}

const team: TeamMember[] = [
  {
    name: "Pranjal Pruthi",
    role: "Core Web Developer & Research Scientist",
    bio: "Research Scientist at CSIR-IGIB: Exploring the frontiers of genomics | Skilled in IT, Full Stack Web development, Database Administration and Bioinformatics, Building innovative and user-friendly platforms",
    avatar: "bg-gradient-to-br from-purple-500 to-pink-500",
    image: "https://pbs.twimg.com/profile_images/1866546460919205889/XF3K4o86_400x400.jpg",
    links: {
      github: "https://github.com/pranjalpruthi",
      linkedin: "https://www.linkedin.com/in/pranjal-pruthi/",
      twitter: "https://x.com/pranjalpruthi",
      website: "https://pranjal.mmm.page",
      email: "mail@pbro.in"
    }
  },
  {
    name: "Dr. Jitendra Narayan",
    role: "Principal Investigator",
    bio: "Specializing in Comparative Genomics, Genome Evolution, Adaptation, Chromosome Rearrangements, HGT, Repeats",
    avatar: "bg-gradient-to-br from-blue-500 to-green-500",
    image: "https://pbs.twimg.com/profile_images/1759517165764427777/-q4XxNJW_400x400.jpg",
    links: {
      website: "https://bioinformaticsonline.com/profile/admin",
      scholar: "https://scholar.google.co.uk/citations?user=ySm4BzcAAAAJ&hl=en",
      researchgate: "https://www.researchgate.net/profile/Jitendra-Narayan-3",
      twitter: "https://x.com/jnarayan81"
    }
  },
  {
    name: "Preeti Agarwal",
    role: "Documentation -PhD & Senior Research Fellow",
    bio: "Institute of Genomics and Integrative Biology | IGIB · Genome Informatics and Structural Biology Research Area (IGIB) | Bioinformatics and Big Data analysis #Pro in SSR analysis",
    avatar: "bg-gradient-to-br from-rose-400 to-orange-500",
    image: "https://pbs.twimg.com/profile_images/1526164953585295360/3WX0lSZn_400x400.jpg",
    links: {
      researchgate: "https://www.researchgate.net/profile/Preeti-Agarwal-16",
      scholar: "https://scholar.google.com/citations?user=8u8WcwoAAAAJ&hl=en"
    }
  },
  {
    name: "Nityendra Shukla",
    role: "Research Scientist - I",
    bio: "Department of Medical Mycology, Vallabhbhai Patel Chest Institute, University of Delhi",
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-500",
    image: "https://media.licdn.com/dms/image/v2/C4D03AQFEmJi_aBDJdQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1658210701985?e=1740009600&v=beta&t=8p7yySN_7wQN7xNBSCAwO41qZ0d8HP2oOyECJQQ4g0o",
    links: {
      researchgate: "https://www.researchgate.net/profile/Nityendra-Shukla-2",
      website: "https://jitendralab.igib.res.in/profile/nityendra21",
      email: "nitinshukla218@gmail.com"
    }
  },
  {
    name: "Ajay Bhatia",
    role: "Data Analyst - PhD & Senior Research Fellow",
    bio: "PhD Student at Jitendra lab, Institute of Genomics and Integrative Biology | IGIB · Genome Informatics and Structural Biology Research Area (IGIB)",
    avatar: "bg-gradient-to-br from-cyan-500 to-blue-500",
    image: "https://i1.rgstatic.net/ii/profile.image/11431281223771539-1707933700618_Q512/Ajay-Bhatia-5.jpg",
    links: {
      researchgate: "https://www.researchgate.net/profile/Ajay-Bhatia-5",
      scholar: "https://scholar.google.com"
    }
  }
];

// Define team members for the animated tooltip
const teamMembers = [
  {
    id: 1,
    name: "Dr. Jitendra Narayan",
    designation: "Principal Investigator",
    image: team[1].image,
  },
  {
    id: 2,
    name: "Pranjal Pruthi",
    designation: "Core Web Developer",
    image: team[0].image,
  },
  {
    id: 3,
    name: "Preeti Agarwal",
    designation: "Documentation & Research",
    image: team[2].image,
  },
  {
    id: 4,
    name: "Nityendra Shukla",
    designation: "Research Scientist",
    image: team[3].image,
  },
  {
    id: 5,
    name: "Ajay Bhatia",
    designation: "Data Analyst",
    image: team[4].image,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function AboutSheet({ children }: { children?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || <Button variant="ghost" className="hover:bg-accent/50 h-9">About</Button>}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <SheetHeader className="space-y-4">
              <SheetTitle className="text-2xl">About CHITRA</SheetTitle>
              <SheetDescription>
                CHITRA (CHromosome Interactive Tool for Rearrangement Analysis) is a powerful tool designed for visualizing and analyzing chromosomal data.
              </SheetDescription>
            </SheetHeader>
          </motion.div>
          


          <div className="mt-6 space-y-6">
            <motion.div variants={fadeIn} className="flex flex-col items-center justify-center w-full">
              <h3 className="text-lg font-semibold mb-4">Meet Our Team</h3>
              <div className="flex flex-row items-center justify-center gap-2">
                <AnimatedTooltip items={teamMembers} />
              </div>
            </motion.div>

            <Separator />

            <motion.div variants={fadeIn}>
              {/* Project Description */}
              <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
              <p className="text-muted-foreground">
                A comprehensive suite of features for exploring chromosomal rearrangements and synteny blocks, making it an invaluable resource for researchers and scientists.
              </p>
            </motion.div>

            <Separator />

            {/* Team Section */}
            <motion.div variants={fadeIn}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Our Team</h3>
                <Badge variant="secondary" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
                  Lab of Bioinformatics and Big Data
                </Badge>
              </div>
              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
              >
                {/* PI Section */}
                <motion.div variants={fadeIn}>
                  <div className="flex items-start space-x-4">
                    <Avatar className={cn("h-12 w-12", team[1].avatar)}>
                      <AvatarImage src={team[1].image} alt={team[1].name} />
                      <AvatarFallback className="text-white">
                        {team[1].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold">{team[1].name}</h4>
                        <p className="text-sm text-muted-foreground">{team[1].role}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{team[1].bio}</p>
                      <div className="flex space-x-2">
                        {team[1].links.website && (
                          <Link href={team[1].links.website} target="_blank" className="text-muted-foreground hover:text-primary">
                            <Globe className="h-4 w-4" />
                          </Link>
                        )}
                        {team[1].links.scholar && (
                          <Link href={team[1].links.scholar} target="_blank" className="text-muted-foreground hover:text-primary">
                            <GraduationCap className="h-4 w-4" />
                          </Link>
                        )}
                        {team[1].links.researchgate && (
                          <Link href={team[1].links.researchgate} target="_blank" className="text-muted-foreground hover:text-primary">
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        )}
                        {team[1].links.twitter && (
                          <Link href={team[1].links.twitter} target="_blank" className="text-muted-foreground hover:text-primary">
                            <Twitter className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Separator className="my-4" />

                {/* Team Members */}
                {[team[0], team[2], team[3], team[4]].map((member) => (
                  <motion.div
                    key={member.name}
                    variants={fadeIn}
                    className="flex items-start space-x-4"
                  >
                    <Avatar className={cn("h-12 w-12", member.avatar)}>
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
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
                        {member.links.email && (
                          <Link href={`mailto:${member.links.email}`} className="text-muted-foreground hover:text-primary">
                            <Mail className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <Separator />

            {/* Funding & Institution */}
            <motion.div variants={fadeIn}>
              <h3 className="text-lg font-semibold mb-2">Funding & Institution</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This project is funded by the Rockefeller Foundation.
                </p>
                <p className="text-sm text-muted-foreground">
                  Hosted at CSIR Institute of Genomics and Integrative Biology (CSIR-IGIB), Delhi, India.
                </p>
              </div>
            </motion.div>

            <Separator />

            {/* Citation */}
            <motion.div variants={fadeIn}>
              <h3 className="text-lg font-semibold mb-2">Citation</h3>
              <code className="block text-sm bg-muted p-4 rounded-md">
                Pruthi, P., Narayan, J., Agarwal, P., Shukla, N., & Bhatia, A. (2024). CHITRA: Chromosome Interactive Tool for Rearrangement Analysis. CSIR-IGIB.
              </code>
            </motion.div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}