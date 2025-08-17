import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User, Edit, Trash2, Users } from "lucide-react";

interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  age?: number;
  appearance: string;
  personality: string;
  background: string;
  relationships: string[];
  avatar?: string;
}

const ProjectCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: "1",
      name: "Lyra Shadowmend",
      description: "A skilled mage with the ability to manipulate shadows and light.",
      role: "Protagonist",
      age: 24,
      appearance: "Tall with raven-black hair and emerald eyes. Often wears dark robes with silver accents.",
      personality: "Determined and brave, but struggles with self-doubt. Has a dry sense of humor.",
      background: "Raised in the Academy of Mystic Arts after her village was destroyed by dark forces.",
      relationships: ["Kael Stormwind", "Elder Thorne"]
    },
    {
      id: "2",
      name: "Kael Stormwind", 
      description: "A dragon rider and Lyra's closest ally.",
      role: "Supporting Character",
      age: 26,
      appearance: "Muscular build with golden hair and storm-gray eyes. Bears scars from dragon battles.",
      personality: "Loyal and protective, with a fierce temper when his friends are threatened.",
      background: "Last of the Dragon Riders, bonded with the storm dragon Tempest.",
      relationships: ["Lyra Shadowmend", "Tempest"]
    }
  ]);
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    role: "",
    age: "",
    appearance: "",
    personality: "",
    background: ""
  });

  const handleAddCharacter = () => {
    setFormData({
      name: "",
      description: "",
      role: "",
      age: "",
      appearance: "",
      personality: "",
      background: ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditCharacter = (character: Character) => {
    setFormData({
      name: character.name,
      description: character.description,
      role: character.role,
      age: character.age?.toString() || "",
      appearance: character.appearance,
      personality: character.personality,
      background: character.background
    });
    setSelectedCharacter(character);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveCharacter = () => {
    const characterData: Character = {
      id: selectedCharacter?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      role: formData.role,
      age: formData.age ? parseInt(formData.age) : undefined,
      appearance: formData.appearance,
      personality: formData.personality,
      background: formData.background,
      relationships: selectedCharacter?.relationships || []
    };

    if (isEditing && selectedCharacter) {
      setCharacters(prev => prev.map(char => 
        char.id === selectedCharacter.id ? characterData : char
      ));
    } else {
      setCharacters(prev => [...prev, characterData]);
    }

    setIsDialogOpen(false);
    setSelectedCharacter(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Card key={character.id} className="group hover:shadow-elegant transition-all bg-gradient-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={character.avatar} />
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
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {character.description}
              </p>
              
              {character.age && (
                <p className="text-sm">
                  <span className="font-medium">Age:</span> {character.age}
                </p>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Appearance</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {character.appearance}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Personality</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {character.personality}
                </p>
              </div>
              
              {character.relationships.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Relationships
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {character.relationships.slice(0, 2).map((rel, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                        {rel}
                      </span>
                    ))}
                    {character.relationships.length > 2 && (
                      <span className="px-2 py-1 bg-muted rounded-full text-xs">
                        +{character.relationships.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Character age"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the character"
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
              <Label htmlFor="personality">Personality</Label>
              <Textarea
                id="personality"
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                placeholder="Personality traits, quirks, and mannerisms"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <Textarea
                id="background"
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                placeholder="Character's history, backstory, and motivations"
                rows={4}
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