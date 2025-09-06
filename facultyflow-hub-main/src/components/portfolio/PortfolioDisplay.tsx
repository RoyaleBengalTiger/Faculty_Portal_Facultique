import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortfolioView } from '@/types/portfolio';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter,
  Calendar,
  Mail,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface PortfolioDisplayProps {
  portfolio: PortfolioView;
  onEdit?: () => void;
}

export const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({
  portfolio,
  onEdit
}) => {
  const { user } = useAuth();

  // ✅ Only allow edit if current user is the portfolio owner or HOD
  const canEdit = user?.id === portfolio.userId;

  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <CardTitle className="text-2xl mb-2">{portfolio.userName}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{portfolio.userEmail}</span>
                  </div>
                  {portfolio.userDepartment && (
                    <Badge variant="outline">{portfolio.userDepartment}</Badge>
                  )}
                  <Badge variant="secondary">{portfolio.userRole}</Badge>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {format(new Date(portfolio.updatedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {portfolio.websiteUrl && (
                  <a
                    href={formatUrl(portfolio.websiteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {portfolio.linkedinUrl && (
                  <a
                    href={formatUrl(portfolio.linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {portfolio.githubUrl && (
                  <a
                    href={formatUrl(portfolio.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {portfolio.twitterUrl && (
                  <a
                    href={formatUrl(portfolio.twitterUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            
            {canEdit && (
              <Button onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Portfolio
              </Button>
            )}
          </div>
          
          {portfolio.bio && (
            <CardContent className="px-0 pb-0">
              <div className="prose dark:prose-invert max-w-none">
                {portfolio.bio.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          )}
        </CardHeader>
      </Card>

      {/* Research Interests */}
      {portfolio.researchInterests && (
        <Card>
          <CardHeader>
            <CardTitle>Research Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {portfolio.researchInterests.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience & Education Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience */}
        {portfolio.experience && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {portfolio.experience.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {portfolio.education && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {portfolio.education.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements */}
      {portfolio.achievements && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements & Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {portfolio.achievements.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
