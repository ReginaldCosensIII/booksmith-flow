import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Globe, MapPin, Crown, Book, Edit, Trash2, Calendar, Scroll } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { worldbuildingService, type WorldNote } from "@/services/worldbuilding";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

const ProjectWorldbuilding = () => {
  const { id: projectId } = useParams();
  const { toast } = useToast();
  const [worldNotes, setWorldNotes] = useState<WorldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredType, setFilteredType] = useState<string | null>(null);
  
  const [selectedNote, setSelectedNote] = useState<WorldNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "location" as WorldNote['type'],
    body: ""
  });

  // Load world notes on mount
  useEffect(() => {
    const loadWorldNotes = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const data = await worldbuildingService.getWorldNotesByProject(projectId);
        setWorldNotes(data);
      } catch (error) {
        console.error('Failed to load world notes:', error);
        toast({
          title: "Error",
          description: "Failed to load world notes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorldNotes();
  }, [projectId, toast]);

  const noteTypes = [
    { value: 'location', label: 'Location', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { value: 'rule', label: 'Rules', icon: Book, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { value: 'timeline', label: 'Timeline', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { value: 'other', label: 'Other', icon: Scroll, color: 'text-gray-600', bg: 'bg-gray-500/10' }
  ];

  const getTypeConfig = (type: string) => {
    return noteTypes.find(t => t.value === type) || noteTypes[noteTypes.length - 1];
  };

  const filteredNotes = filteredType 
    ? worldNotes.filter(note => note.type === filteredType)
    : worldNotes;

  const handleAddNote = () => {
    setFormData({
      title: "",
      type: "location",
      body: ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: WorldNote) => {
    setFormData({
      title: note.title,
      type: note.type || "location",
      body: note.body || ""
    });
    setSelectedNote(note);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Optimistic updates for world note operations
  const { execute: createNoteWithOptimism } = useOptimisticUpdate(
    worldbuildingService.createWorldNote,
    {
      successMessage: "World note created successfully!",
      errorMessage: "Failed to create world note. Please try again.",
    }
  );

  const { execute: updateNoteWithOptimism } = useOptimisticUpdate(
    worldbuildingService.updateWorldNote,
    {
      successMessage: "World note updated successfully!",
      errorMessage: "Failed to update world note. Please try again.",
    }
  );

  const { execute: deleteNoteWithOptimism } = useOptimisticUpdate(
    worldbuildingService.deleteWorldNote,
    {
      successMessage: "World note deleted successfully!",
      errorMessage: "Failed to delete world note. Please try again.",
    }
  );

  const handleSaveNote = async () => {
    if (!projectId || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && selectedNote) {
      // Update existing note
      const updatedData = {
        title: formData.title,
        type: formData.type,
        body: formData.body
      };

      await updateNoteWithOptimism(
        () => {
          setWorldNotes(prev => prev.map(note => 
            note.id === selectedNote.id 
              ? { ...note, ...updatedData }
              : note
          ));
        },
        () => {
          setWorldNotes(prev => prev.map(note => 
            note.id === selectedNote.id 
              ? selectedNote
              : note
          ));
        },
        selectedNote.id,
        updatedData
      );
    } else {
      // Create new note
      const newNoteData = {
        project_id: projectId,
        title: formData.title,
        type: formData.type,
        body: formData.body
      };

      const tempId = Date.now().toString();
      const tempNote = {
        ...newNoteData,
        id: tempId,
        created_at: new Date().toISOString()
      };

      const result = await createNoteWithOptimism(
        () => {
          setWorldNotes(prev => [...prev, tempNote]);
        },
        () => {
          setWorldNotes(prev => prev.filter(note => note.id !== tempId));
        },
        newNoteData
      );

      if (result) {
        // Replace temp note with real one
        setWorldNotes(prev => prev.map(note => 
          note.id === tempId ? result : note
        ));
      }
    }

    setIsDialogOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async (note: WorldNote) => {
    await deleteNoteWithOptimism(
      () => {
        setWorldNotes(prev => prev.filter(n => n.id !== note.id));
      },
      () => {
        setWorldNotes(prev => [...prev, note]);
      },
      note.id
    );
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

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filteredType === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilteredType(null)}
          className="text-foreground"
        >
          All ({worldNotes.length})
        </Button>
        {noteTypes.map((type) => {
          const Icon = type.icon;
          const count = worldNotes.filter(note => note.type === type.value).length;
          return (
            <Button
              key={type.value}
              variant={filteredType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilteredType(type.value)}
              className={`${type.bg} ${type.color} border-current/20 hover:${type.bg}/80`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {type.label} ({count})
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading world notes...</div>
        </div>
      ) : worldNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="p-4 bg-muted/10 rounded-full">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No world notes yet</h3>
            <p className="text-muted-foreground mb-4">Create your first world note to start building your story's universe.</p>
            <Button onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Note
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteNote(note)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {note.body && (
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {note.body}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Detailed information about this world element..."
                rows={12}
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