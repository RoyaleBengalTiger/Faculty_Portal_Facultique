import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioForm } from '@/components/portfolio/PortfolioForm';
import { PortfolioDisplay } from '@/components/portfolio/PortfolioDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioApi } from '@/services/api';
import { PortfolioView, PortfolioCreateDto } from '@/types/portfolio';
import { Plus, Users, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ViewMode = 'my' | 'all' | 'create' | 'edit';

export const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [myPortfolio, setMyPortfolio] = useState<PortfolioView | null>(null);
  const [allPortfolios, setAllPortfolios] = useState<PortfolioView[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioView | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('my');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user's own portfolio
      if (user?.role === 'FACULTY' || user?.role === 'HOD' || user?.role === 'ADMIN') {
        try {
          const portfolio = await portfolioApi.getMyPortfolio();
          setMyPortfolio(portfolio);
        } catch (error: any) {
          if (error.status !== 404) {
            console.error('Error fetching my portfolio:', error);
          }
        }
      }

      // Fetch all portfolios for HOD/ADMIN
      if (user?.role === 'HOD' || user?.role === 'ADMIN') {
        try {
          const portfolios = await portfolioApi.getAllPortfolios();
          setAllPortfolios(portfolios);
        } catch (error) {
          console.error('Error fetching all portfolios:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = () => {
    setViewMode('create');
  };

  const handleEditPortfolio = () => {
    setViewMode('edit');
  };

  const handleSave = async (data: PortfolioCreateDto) => {
    setFormLoading(true);
    try {
      const savedPortfolio = await portfolioApi.createOrUpdateMyPortfolio(data);
      
      toast({ 
        title: 'Success', 
        description: myPortfolio 
          ? 'Portfolio updated successfully!' 
          : 'Portfolio created successfully!' 
      });
      
      setMyPortfolio(savedPortfolio);
      setViewMode('my');
      
      if (user?.role === 'HOD' || user?.role === 'ADMIN') {
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save portfolio',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setViewMode('my');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your portfolio? This action cannot be undone.')) {
      return;
    }
    
    try {
      await portfolioApi.deleteMyPortfolio();
      toast({ 
        title: 'Success', 
        description: 'Portfolio deleted successfully!' 
      });
      setMyPortfolio(null);
      setViewMode('my');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete portfolio',
        variant: 'destructive'
      });
    }
  };

  const handleViewPortfolio = (portfolio: PortfolioView) => {
    setSelectedPortfolio(portfolio);
  };

  const handleBackToList = () => {
    setSelectedPortfolio(null);
  };

  // Show create/edit form
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancelForm}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {viewMode === 'create' ? 'Create Portfolio' : 'Edit Portfolio'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'create' 
                ? 'Create your professional portfolio to showcase your background'
                : 'Update your professional portfolio information'
              }
            </p>
          </div>
        </div>

        <PortfolioForm
          portfolio={viewMode === 'edit' ? myPortfolio || undefined : undefined}
          onSave={handleSave}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      </div>
    );
  }

  // Show selected portfolio details
  if (selectedPortfolio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Portfolios
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedPortfolio.userName}'s Portfolio</h1>
            <p className="text-muted-foreground">{selectedPortfolio.userEmail}</p>
          </div>
        </div>
        
        <PortfolioDisplay
          portfolio={selectedPortfolio}
          onEdit={selectedPortfolio.userId === user?.id ? handleEditPortfolio : undefined}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">Loading portfolios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            {viewMode === 'my'
              ? myPortfolio 
                ? "Manage your professional portfolio"
                : "Create your professional portfolio to showcase your achievements"
              : `Browse all faculty portfolios (${allPortfolios.length} total)`
            }
          </p>
        </div>
        
        {(user?.role === 'HOD' || user?.role === 'ADMIN') && (
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'my' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('my')}
            >
              <Eye className="w-4 h-4 mr-2" />
              My Portfolio
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('all')}
            >
              <Users className="w-4 h-4 mr-2" />
              All Portfolios ({allPortfolios.length})
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'my' ? (
        myPortfolio ? (
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button onClick={handleEditPortfolio}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Portfolio
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Portfolio
              </Button>
            </div>
            <PortfolioDisplay portfolio={myPortfolio} onEdit={handleEditPortfolio} />
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Portfolio Yet</h3>
                <p className="text-muted-foreground">
                  Create your professional portfolio to showcase your background, experience, 
                  research interests, and achievements to colleagues and administrators.
                </p>
                <Button onClick={handleCreatePortfolio} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create My Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-6">
          {allPortfolios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="max-w-md mx-auto space-y-4">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No Portfolios Found</h3>
                  <p className="text-muted-foreground">
                    Faculty members haven't created their portfolios yet. 
                    Encourage them to create their professional portfolios.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPortfolios.map((portfolio) => (
                <Card 
                  key={portfolio.id} 
                  className="card-hover cursor-pointer transition-all duration-200"
                  onClick={() => handleViewPortfolio(portfolio)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{portfolio.userName}</CardTitle>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>{portfolio.userEmail}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {portfolio.userDepartment && (
                          <Badge variant="outline">{portfolio.userDepartment}</Badge>
                        )}
                        <Badge variant="secondary">{portfolio.userRole}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {portfolio.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {portfolio.bio}
                      </p>
                    )}
                    
                    {portfolio.researchInterests && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Research Interests:</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {portfolio.researchInterests}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Updated {format(new Date(portfolio.updatedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
