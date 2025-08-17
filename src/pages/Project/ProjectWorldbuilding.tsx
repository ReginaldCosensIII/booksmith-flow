import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Globe, MapPin, Crown, Book, Edit, Trash2 } from "lucide-react";

interface WorldNote {
  id: string;
  title: string;
  type: 'location' | 'culture' | 'history' | 'magic' | 'politics' | 'other';
  description: string;
  details: string;
  connections: string[];
}

const ProjectWorldbuilding = () => {
  const [worldNotes, setWorldNotes] = useState<WorldNote[]>([
    {
      id: "1",
      title: "Kingdom of Eldara",
      type: "location",
      description: "A mystical realm where magic flows through ancient ley lines.",
      details: "The Kingdom of Eldara is built upon a network of magical ley lines that converge at the Crystal Spire in the capital city. The landscape is diverse, ranging from the Whispering Cliffs in the north to the Shadowlands in the south. Magic is commonplace here, with floating bridges connecting the city districts and crystal formations providing natural lighting.",
      connections: ["Crystal Spire", "Whispering Cliffs"]
    },
    {
      id: "2", 
      title: "Dragon Riders Order",
      type: "culture",
      description: "An ancient order of warriors bonded with dragons.",
      details: "The Dragon Riders were once the protectors of Eldara, with each rider forming a lifelong bond with a dragon hatchling. The order was nearly destroyed in the Great War, leaving only a handful of riders scattered across the realm. They follow a strict code of honor and are trained from childhood in both combat and dragon care.",
      connections: ["Kael Stormwind", "Great War"]
    },
    {
      id: "3",
      title: "The Dragon's Echo",
      type: "magic",
      description: "A legendary artifact of immense magical power.",
      details: "The Dragon's Echo is said to be a crystallized fragment of the first dragon's roar, containing the pure essence of creation magic. It was hidden away centuries ago when its power threatened to tear reality apart. The artifact can amplify any magical ability a hundredfold, but at great personal cost to the wielder.",
      connections: ["First Dragon", "Creation Magic"]
    }
  ]);
  
  const [selectedNote, setSelectedNote] = useState<WorldNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "location" as WorldNote['type'],
    description: "",
    details: ""
  });

  const noteTypes = [
    { value: 'location', label: 'Location', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { value: 'culture', label: 'Culture', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { value: 'history', label: 'History', icon: Book, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { value: 'magic', label: 'Magic', icon: Globe, color: 'text-pink-600', bg: 'bg-pink-500/10' },
    { value: 'politics', label: 'Politics', icon: Crown, color: 'text-red-600', bg: 'bg-red-500/10' },
    { value: 'other', label: 'Other', icon: Book, color: 'text-gray-600', bg: 'bg-gray-500/10' }
  ];

  const getTypeConfig = (type: string) => {
    return noteTypes.find(t => t.value === type) || noteTypes[noteTypes.length - 1];
  };

  const handleAddNote = () => {
    setFormData({
      title: "",
      type: "location",
      description: "",
      details: ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: WorldNote) => {
    setFormData({
      title: note.title,
      type: note.type,
      description: note.description,
      details: note.details
    });
    setSelectedNote(note);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveNote = () => {
    const noteData: WorldNote = {
      id: selectedNote?.id || Date.now().toString(),
      title: formData.title,
      type: formData.type,
      description: formData.description,
      details: formData.details,
      connections: selectedNote?.connections || []
    };

    if (isEditing && selectedNote) {
      setWorldNotes(prev => prev.map(note => 
        note.id === selectedNote.id ? noteData : note
      ));
    } else {
      setWorldNotes(prev => [...prev, noteData]);
    }

    setIsDialogOpen(false);
    setSelectedNote(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Worldbuilding</h1>
          <p className="text-muted-foreground">Create and organize your story's world, locations, and lore</p>
        </div>
        
        <Button onClick={handleAddNote} className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add World Note
        </Button>
      </div>

      {/* Filter by type */}
      <div className="flex flex-wrap gap-2">
        {noteTypes.map((type) => {
          const Icon = type.icon;
          const count = worldNotes.filter(note => note.type === type.value).length;
          return (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              className={`${type.bg} ${type.color} border-current/20 hover:${type.bg}/80`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {type.label} ({count})
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worldNotes.map((note) => {
          const typeConfig = getTypeConfig(note.type);
          const Icon = typeConfig.icon;
          
          return (
            <Card key={note.id} className="group hover:shadow-elegant transition-all bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                      <Icon className={`h-5 w-5 ${typeConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <span className={`text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditNote(note)}
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
                  {note.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Details</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {note.details}
                  </p>
                </div>
                
                {note.connections.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Connected To</h4>
                    <div className="flex flex-wrap gap-1">
                      {note.connections.slice(0, 3).map((connection, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                          {connection}
                        </span>
                      ))}
                      {note.connections.length > 3 && (
                        <span className="px-2 py-1 bg-muted rounded-full text-xs">
                          +{note.connections.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* World Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit World Note" : "Add New World Note"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update your world note details" : "Create a new entry for your world"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Name of location, culture, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WorldNote['type'] })}
                  className="w-full p-2 border border-input bg-background rounded-md"
                >
                  {noteTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description or summary"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Detailed Information</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Detailed description, history, characteristics, etc."
                rows={8}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              {isEditing ? "Update Note" : "Add Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectWorldbuilding;