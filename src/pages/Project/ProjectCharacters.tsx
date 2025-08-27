import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { charactersService, type Character } from "@/services/characters";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

const ProjectCharacters = () => {
  const { id: projectId } = useParams();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    appearance: "",
    goals: "",
    backstory: "",
    relationships: "",
    notes: ""
  });

  // Load characters on mount
  useEffect(() => {
    const loadCharacters = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const data = await charactersService.getCharactersByProject(projectId);
        setCharacters(data);
      } catch (error) {
        console.error('Failed to load characters:', error);
        toast({
          title: "Error",
          description: "Failed to load characters. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [projectId, toast]);

  const handleAddCharacter = () => {
    setFormData({
      name: "",
      role: "",
      appearance: "",
      goals: "",
      backstory: "",
      relationships: "",
      notes: ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditCharacter = (character: Character) => {
    setFormData({
      name: character.name,
      role: character.role || "",
      appearance: character.appearance || "",
      goals: character.goals || "",
      backstory: character.backstory || "",
      relationships: character.relationships || "",
      notes: character.notes || ""
    });
    setSelectedCharacter(character);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Optimistic updates for character operations
  const { execute: createCharacterWithOptimism } = useOptimisticUpdate(
    charactersService.createCharacter,
    {
      successMessage: "Character created successfully!",
      errorMessage: "Failed to create character. Please try again.",
    }
  );

  const { execute: updateCharacterWithOptimism } = useOptimisticUpdate(
    charactersService.updateCharacter,
    {
      successMessage: "Character updated successfully!",
      errorMessage: "Failed to update character. Please try again.",
    }
  );

  const { execute: deleteCharacterWithOptimism } = useOptimisticUpdate(
    charactersService.deleteCharacter,
    {
      successMessage: "Character deleted successfully!",
      errorMessage: "Failed to delete character. Please try again.",
    }
  );

  const handleSaveCharacter = async () => {
    if (!projectId || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Character name is required.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && selectedCharacter) {
      // Update existing character
      const updatedData = {
        name: formData.name,
        role: formData.role,
        appearance: formData.appearance,
        goals: formData.goals,
        backstory: formData.backstory,
        relationships: formData.relationships,
        notes: formData.notes
      };

      await updateCharacterWithOptimism(
        () => {
          setCharacters(prev => prev.map(char => 
            char.id === selectedCharacter.id 
              ? { ...char, ...updatedData }
              : char
          ));
        },
        () => {
          setCharacters(prev => prev.map(char => 
            char.id === selectedCharacter.id 
              ? selectedCharacter
              : char
          ));
        },
        selectedCharacter.id,
        updatedData
      );
    } else {
      // Create new character
      const newCharacterData = {
        project_id: projectId,
        name: formData.name,
        role: formData.role,
        appearance: formData.appearance,
        goals: formData.goals,
        backstory: formData.backstory,
        relationships: formData.relationships,
        notes: formData.notes
      };

      const tempId = Date.now().toString();
      const tempCharacter = {
        ...newCharacterData,
        id: tempId,
        created_at: new Date().toISOString()
      };

      const result = await createCharacterWithOptimism(
        () => {
          setCharacters(prev => [...prev, tempCharacter]);
        },
        () => {
          setCharacters(prev => prev.filter(char => char.id !== tempId));
        },
        newCharacterData
      );

      if (result) {
        // Replace temp character with real one
        setCharacters(prev => prev.map(char => 
          char.id === tempId ? result : char
        ));
      }
    }

    setIsDialogOpen(false);
    setSelectedCharacter(null);
  };

  const handleDeleteCharacter = async (character: Character) => {
    await deleteCharacterWithOptimism(
      () => {
        setCharacters(prev => prev.filter(char => char.id !== character.id));
      },
      () => {
        setCharacters(prev => [...prev, character]);
      },
      character.id
    );
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'protagonist': return 'bg-primary/10 text-primary';
      case 'antagonist': return 'bg-destructive/10 text-destructive';
      case 'supporting character': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Characters</h1>
          <p className="text-muted-foreground">Create and manage your story's characters</p>
        </div>
        
        <Button onClick={handleAddCharacter} className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading characters...</div>
        </div>
      ) : characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="p-4 bg-muted/10 rounded-full">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No characters yet</h3>
            <p className="text-muted-foreground mb-4">Create your first character to start building your story's cast.</p>
            <Button onClick={handleAddCharacter}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Character
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
          <Card key={character.id} className="group hover:shadow-elegant transition-all bg-gradient-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12">
                     <AvatarFallback>
                       <User className="h-6 w-6" />
                     </AvatarFallback>
                   </Avatar>
                  <div>
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(character.role)}`}>
                      {character.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditCharacter(character)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                   <Button 
                     variant="ghost" 
                     size="icon"
                     onClick={() => handleDeleteCharacter(character)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            </CardHeader>
            
             <CardContent className="space-y-3">
               {character.goals && (
                 <p className="text-sm text-muted-foreground line-clamp-2">
                   {character.goals}
                 </p>
               )}
               
               {character.appearance && (
                 <div className="space-y-2">
                   <h4 className="font-medium text-sm">Appearance</h4>
                   <p className="text-sm text-muted-foreground line-clamp-2">
                     {character.appearance}
                   </p>
                 </div>
               )}
               
               {character.backstory && (
                 <div className="space-y-2">
                   <h4 className="font-medium text-sm">Background</h4>
                   <p className="text-sm text-muted-foreground line-clamp-2">
                     {character.backstory}
                   </p>
                 </div>
               )}
               
               {character.relationships && character.relationships.trim() && (
                 <div className="space-y-2">
                   <h4 className="font-medium text-sm flex items-center gap-1">
                     <Users className="h-4 w-4" />
                     Relationships
                   </h4>
                   <p className="text-sm text-muted-foreground line-clamp-2">
                     {character.relationships}
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
          ))}
        </div>
      )}

      {/* Character Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Character" : "Add New Character"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update your character's details" : "Create a new character for your story"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Character name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Protagonist, Antagonist, Supporting Character"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="Character's goals and motivations"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appearance">Appearance</Label>
              <Textarea
                id="appearance"
                value={formData.appearance}
                onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                placeholder="Physical appearance and clothing style"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backstory">Background</Label>
              <Textarea
                id="backstory"
                value={formData.backstory}
                onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                placeholder="Character's history, backstory, and background"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationships">Relationships</Label>
              <Textarea
                id="relationships"
                value={formData.relationships}
                onChange={(e) => setFormData({ ...formData, relationships: e.target.value })}
                placeholder="Key relationships with other characters"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this character"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCharacter}>
              {isEditing ? "Update Character" : "Add Character"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCharacters;