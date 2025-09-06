import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioView, PortfolioCreateDto } from '@/types/portfolio';
import { ArrowLeft, Save, Eye, Globe, Linkedin, Github, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioFormProps {
  portfolio?: PortfolioView;
  onSave: (data: PortfolioCreateDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({
  portfolio,
  onSave,
  onCancel,
  loading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PortfolioCreateDto>({
    bio: '',
    websiteUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    researchInterests: '',
    achievements: '',
    education: '',
    experience: ''
  });
  
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (portfolio) {
      setFormData({
        bio: portfolio.bio || '',
        websiteUrl: portfolio.websiteUrl || '',
        linkedinUrl: portfolio.linkedinUrl || '',
        githubUrl: portfolio.githubUrl || '',
        twitterUrl: portfolio.twitterUrl || '',
        researchInterests: portfolio.researchInterests || '',
        achievements: portfolio.achievements || '',
        education: portfolio.education || '',
        experience: portfolio.experience || ''
      });
    }
  }, [portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bio?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Bio is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await onSave(formData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save portfolio',
        variant: 'destructive'
      });
    }
  };

  if (preview) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
        </div>

        {/* Preview Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Portfolio Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            {formData.bio && (
              <div>
                <h3 className="font-semibold mb-2">Professional Bio</h3>
                <p className="text-muted-foreground leading-relaxed">{formData.bio}</p>
              </div>
            )}

            {/* Research Interests */}
            {formData.researchInterests && (
              <div>
                <h3 className="font-semibold mb-2">Research Interests</h3>
                <p className="text-muted-foreground leading-relaxed">{formData.researchInterests}</p>
              </div>
            )}

            {/* Social Links */}
            <div>
              <h3 className="font-semibold mb-2">Links</h3>
              <div className="space-y-2">
                {formData.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formData.websiteUrl}</span>
                  </div>
                )}
                {formData.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formData.linkedinUrl}</span>
                  </div>
                )}
                {formData.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formData.githubUrl}</span>
                  </div>
                )}
                {formData.twitterUrl && (
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formData.twitterUrl}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {portfolio ? 'Update' : 'Create'} Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Professional Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Write a brief professional bio about yourself..."
            rows={4}
            maxLength={2048}
            required
          />
          <div className="text-sm text-muted-foreground mt-1">
            {formData.bio.length}/2048 characters
          </div>
        </CardContent>
      </Card>

      {/* Research Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Research Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.researchInterests}
            onChange={(e) => setFormData(prev => ({ ...prev, researchInterests: e.target.value }))}
            placeholder="Describe your research interests and areas of expertise..."
            rows={3}
            maxLength={1024}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {formData.researchInterests.length}/1024 characters
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            placeholder="Describe your work experience, positions held, and key responsibilities..."
            rows={6}
            maxLength={2048}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {formData.experience.length}/2048 characters
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.education}
            onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
            placeholder="List your educational background, degrees, institutions..."
            rows={4}
            maxLength={2048}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {formData.education.length}/2048 characters
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements & Awards</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.achievements}
            onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
            placeholder="List your notable achievements, awards, publications, and recognitions..."
            rows={4}
            maxLength={2048}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {formData.achievements.length}/2048 characters
          </div>
        </CardContent>
      </Card>

      {/* Social Media & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Personal Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="website"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="pl-10"
                maxLength={1024}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                className="pl-10"
                maxLength={1024}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="github"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username"
                className="pl-10"
                maxLength={1024}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X Profile</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="twitter"
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/username"
                className="pl-10"
                maxLength={1024}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
