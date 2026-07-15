"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { getRecipeById, scaleRecipe } from "@/lib/mock/recipes";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const isPro = user?.plan === "pro";
  const base = getRecipeById(id);
  const [servings, setServings] = useState(base?.servings || 1);

  const recipe = useMemo(() => {
    if (!base) return null;
    return scaleRecipe(base, servings);
  }, [base, servings]);

  if (!base || !recipe) {
    return <p>Recipe not found.</p>;
  }

  const locked = recipe.isPro && !isPro;

  return (
    <div>
      <Link
        href="/recipes"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft size={16} />
        Recipes
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-apex-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.imageUrl} alt="" className="aspect-video w-full object-cover" />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {recipe.categories.slice(0, 3).map((c) => (
              <Badge key={c} className="capitalize">
                {c}
              </Badge>
            ))}
            {recipe.isPro && <Badge variant="accent">Pro</Badge>}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">{recipe.name}</h1>
          <p className="mt-2 text-sm text-muted">
            Prep {recipe.prepMinutes}m · Cook {recipe.cookMinutes}m · {recipe.difficulty}
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              ["kcal", recipe.calories],
              ["P", `${recipe.protein}g`],
              ["C", `${recipe.carbs}g`],
              ["F", `${recipe.fat}g`],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-2xl bg-muted-bg p-3">
                <p className="font-display text-lg font-bold">{v}</p>
                <p className="text-[10px] text-muted">{k}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Portions</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setServings(n)}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    servings === n
                      ? "bg-accent text-accent-fg"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {n}×
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                toast(
                  locked
                    ? "Upgrade to Pro to log personalized recipes."
                    : `Logged ${recipe.name} to food tracker (demo).`,
                  locked ? "info" : "success",
                )
              }
            >
              Log to calorie tracker
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast(
                  isPro
                    ? "Ingredients added to grocery list (demo)."
                    : "Smart grocery lists are a Pro feature.",
                  isPro ? "success" : "info",
                )
              }
            >
              <ShoppingCart size={16} />
              Grocery list
            </Button>
          </div>
        </div>
      </div>

      {locked ? (
        <Card className="mt-6 border-accent/40 text-center">
          <Crown className="mx-auto text-accent-dim dark:text-accent" />
          <h2 className="mt-3 font-display text-xl font-semibold">
            Unlock personalized Pro recipes
          </h2>
          <p className="mt-2 text-sm text-muted">
            Get full instructions, weekly meal plans, macro-based suggestions, and
            automatic portion adjustments.
          </p>
          <Button className="mt-4" onClick={() => router.push("/pricing")}>
            Upgrade to Pro
          </Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display font-semibold">Ingredients</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex justify-between">
                  <span>
                    {ing.name}{" "}
                    <span className="text-muted">({ing.amount})</span>
                  </span>
                  <span className="text-muted">{ing.calories} kcal</span>
                </li>
              ))}
            </ul>
            {recipe.allergens.length > 0 && (
              <p className="mt-3 text-xs text-warning">
                Allergens: {recipe.allergens.join(", ")}
              </p>
            )}
          </Card>
          <Card>
            <h2 className="font-display font-semibold">Steps</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted">
              {recipe.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted">
              Equipment: {recipe.equipment.join(", ")} · Portion: {recipe.portionSize}
            </p>
          </Card>
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Nutrition values are estimates for planning only and not medical advice.
      </p>
    </div>
  );
}
